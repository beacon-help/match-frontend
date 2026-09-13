import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import TaskImagePicker from './TaskImagePicker.svelte';
import { MAX_IMAGES } from '$lib/tasks/imagePrepare';
import type { TaskImage } from '$lib/types/task';

function jpeg(name: string): File {
	return new File(['x'], name, { type: 'image/jpeg' });
}

function storedImages(count: number): TaskImage[] {
	return Array.from({ length: count }, (_, i) => ({
		id: `img-${i}`,
		path: `http://api.test/task/images/img-${i}`
	}));
}

function addControl(): HTMLInputElement {
	return screen.getByLabelText(/Add photo/) as HTMLInputElement;
}

/** jsdom won't let a file input be populated by assignment, so the list is forced on. */
function pick(input: HTMLInputElement, files: File[]) {
	Object.defineProperty(input, 'files', { value: files, writable: true, configurable: true });
	return fireEvent.change(input);
}

function photoCount(count: number) {
	return screen.getByText(`${count} of ${MAX_IMAGES} photos`, { exact: false });
}

let created: string[] = [];

// jsdom implements neither, and they are the thing most worth asserting on here. These are
// installed for the whole file rather than stubbed per test: testing-library unmounts
// components after each test, and that teardown still needs revokeObjectURL to exist.
const createObjectURL = vi.fn(() => {
	const url = `blob:mock/${created.length}`;
	created.push(url);
	return url;
});
const revokeObjectURL = vi.fn();
URL.createObjectURL = createObjectURL;
URL.revokeObjectURL = revokeObjectURL;

beforeEach(() => {
	created = [];
	createObjectURL.mockClear();
	revokeObjectURL.mockClear();
});

describe('TaskImagePicker', () => {
	test('offers a keyboard-reachable add control when the task has no photos', () => {
		render(TaskImagePicker, { props: { pending: [] } });

		// `display: none` would drop the input out of the tab order entirely.
		expect(addControl()).not.toHaveClass('hidden');
		expect(addControl()).toBeEnabled();
	});

	test('reports how many photos the task holds against the cap', () => {
		render(TaskImagePicker, { props: { pending: [], existing: storedImages(2) } });

		expect(photoCount(2)).toBeInTheDocument();
	});

	test('hides the add control once the cap is reached', () => {
		render(TaskImagePicker, { props: { pending: [], existing: storedImages(MAX_IMAGES) } });

		expect(screen.queryByLabelText(/Add photo/)).not.toBeInTheDocument();
	});

	test('frees a slot again for an existing photo already marked for removal', () => {
		render(TaskImagePicker, {
			props: { pending: [], existing: storedImages(MAX_IMAGES), removedIds: ['img-0'] }
		});

		expect(addControl()).toBeInTheDocument();
		expect(photoCount(MAX_IMAGES - 1)).toBeInTheDocument();
	});

	test('marking an existing photo for removal drops it from the grid', async () => {
		render(TaskImagePicker, { props: { pending: [], existing: storedImages(2) } });

		await fireEvent.click(screen.getByLabelText('Remove attachment 1'));

		await waitFor(() => expect(photoCount(1)).toBeInTheDocument());
	});

	test('creates one preview URL per pending photo', () => {
		render(TaskImagePicker, { props: { pending: [jpeg('a.jpg'), jpeg('b.jpg')] } });

		expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
		expect(screen.getByAltText('a.jpg')).toHaveAttribute('src', created[0]);
	});

	test('revokes only the preview URL of the photo that was removed', async () => {
		render(TaskImagePicker, { props: { pending: [jpeg('a.jpg'), jpeg('b.jpg')] } });

		await fireEvent.click(screen.getByLabelText('Remove a.jpg'));

		await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith(created[0]));
		expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(created[1]);
	});

	test('revokes every preview URL when the picker unmounts', () => {
		const { unmount } = render(TaskImagePicker, {
			props: { pending: [jpeg('a.jpg'), jpeg('b.jpg')] }
		});

		unmount();

		expect(URL.revokeObjectURL).toHaveBeenCalledWith(created[0]);
		expect(URL.revokeObjectURL).toHaveBeenCalledWith(created[1]);
	});

	test('rejects a file of the wrong type and announces why', async () => {
		render(TaskImagePicker, { props: { pending: [] } });

		await pick(addControl(), [new File(['x'], 'notes.pdf', { type: 'application/pdf' })]);

		// The live region is rendered empty up front, so wait for the message rather than
		// for the container.
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('notes.pdf'));
		expect(URL.createObjectURL).not.toHaveBeenCalled();
	});

	test('accepts a valid photo and previews it', async () => {
		render(TaskImagePicker, { props: { pending: [] } });

		await pick(addControl(), [jpeg('holiday.jpg')]);

		expect(await screen.findByAltText('holiday.jpg')).toBeInTheDocument();
		expect(photoCount(1)).toBeInTheDocument();
	});

	test('skips photos beyond the cap and names the ones it dropped', async () => {
		render(TaskImagePicker, { props: { pending: [], existing: storedImages(MAX_IMAGES - 1) } });

		await pick(addControl(), [jpeg('kept.jpg'), jpeg('dropped.jpg')]);

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('dropped.jpg'));
		expect(screen.getByAltText('kept.jpg')).toBeInTheDocument();
	});
});
