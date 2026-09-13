import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyImageChanges } from './applyImageChanges';
import { addTaskImages, removeTaskImage } from '$lib/api/task';
import { ApiError } from '$lib/api/client';
import type { Task, TaskImage } from '$lib/types/task';

vi.mock('$lib/api/task', () => ({
	addTaskImages: vi.fn(),
	removeTaskImage: vi.fn()
}));

function taskWith(images: TaskImage[]): Task {
	return {
		id: 1,
		title: 'Move furniture',
		status: 'open',
		location: { address: 'Valencia', lat: 39.47, lon: -0.38 },
		category: 'transport people',
		description: 'Need help moving',
		created_at: '2026-07-01T00:00:00Z',
		updated_at: null,
		owner: { id: 10, first_name: 'Owner' },
		helper: null,
		helper_offers: [],
		images
	};
}

function jpeg(name: string): File {
	return new File(['x'], name, { type: 'image/jpeg' });
}

const TOKEN = 'token';

beforeEach(() => {
	vi.mocked(removeTaskImage).mockReset();
	vi.mocked(addTaskImages).mockReset();
});

describe('applyImageChanges', () => {
	it('does nothing when there is nothing queued', async () => {
		const result = await applyImageChanges(1, { removedIds: [], added: [] }, TOKEN);

		expect(removeTaskImage).not.toHaveBeenCalled();
		expect(addTaskImages).not.toHaveBeenCalled();
		expect(result).toEqual({ task: null, remaining: { removedIds: [], added: [] }, error: null });
	});

	it('removes every queued photo and reports the latest task', async () => {
		const final = taskWith([]);
		vi.mocked(removeTaskImage).mockResolvedValueOnce(taskWith([{ id: 'b', path: 'p' }]));
		vi.mocked(removeTaskImage).mockResolvedValueOnce(final);

		const result = await applyImageChanges(1, { removedIds: ['a', 'b'], added: [] }, TOKEN);

		expect(removeTaskImage).toHaveBeenCalledTimes(2);
		expect(result.task).toBe(final);
		expect(result.error).toBeNull();
		expect(result.remaining).toEqual({ removedIds: [], added: [] });
	});

	it('uploads queued files in a single call', async () => {
		const final = taskWith([{ id: 'new', path: 'p' }]);
		vi.mocked(addTaskImages).mockResolvedValue(final);
		const files = [jpeg('a.jpg'), jpeg('b.jpg')];

		const result = await applyImageChanges(1, { removedIds: [], added: files }, TOKEN);

		expect(addTaskImages).toHaveBeenCalledExactlyOnceWith(1, files, TOKEN);
		expect(result.task).toBe(final);
		expect(result.error).toBeNull();
	});

	it('removes before it adds, so swapping photos never trips the cap', async () => {
		const order: string[] = [];
		vi.mocked(removeTaskImage).mockImplementation(async () => {
			order.push('remove');
			return taskWith([]);
		});
		vi.mocked(addTaskImages).mockImplementation(async () => {
			order.push('add');
			return taskWith([]);
		});

		await applyImageChanges(1, { removedIds: ['a'], added: [jpeg('a.jpg')] }, TOKEN);

		expect(order).toEqual(['remove', 'add']);
	});

	it('keeps only the outstanding removals when one fails partway', async () => {
		const afterFirst = taskWith([{ id: 'b', path: 'p' }]);
		vi.mocked(removeTaskImage).mockResolvedValueOnce(afterFirst);
		vi.mocked(removeTaskImage).mockRejectedValueOnce(new ApiError('boom', 500));

		const result = await applyImageChanges(1, { removedIds: ['a', 'b'], added: [] }, TOKEN);

		// 'a' is gone for good, so a retry must not ask for it again.
		expect(result.remaining.removedIds).toEqual(['b']);
		expect(result.task).toBe(afterFirst);
		expect(result.error).toContain('1 of them went through');
	});

	it('does not claim progress when the very first removal fails', async () => {
		vi.mocked(removeTaskImage).mockRejectedValueOnce(new ApiError('boom', 500));

		const result = await applyImageChanges(1, { removedIds: ['a'], added: [] }, TOKEN);

		expect(result.error).not.toContain('went through');
		expect(result.remaining.removedIds).toEqual(['a']);
		expect(result.task).toBeNull();
	});

	it('skips the upload when a removal failed, keeping both queues intact', async () => {
		vi.mocked(removeTaskImage).mockRejectedValueOnce(new ApiError('boom', 500));
		const files = [jpeg('a.jpg')];

		const result = await applyImageChanges(1, { removedIds: ['a'], added: files }, TOKEN);

		expect(addTaskImages).not.toHaveBeenCalled();
		expect(result.remaining).toEqual({ removedIds: ['a'], added: files });
	});

	it('keeps the files queued when the upload fails', async () => {
		const afterRemoval = taskWith([]);
		vi.mocked(removeTaskImage).mockResolvedValueOnce(afterRemoval);
		vi.mocked(addTaskImages).mockRejectedValueOnce(new ApiError('boom', 500));
		const files = [jpeg('a.jpg')];

		const result = await applyImageChanges(1, { removedIds: ['a'], added: files }, TOKEN);

		// The removal still stands, so only the upload should be retried.
		expect(result.remaining).toEqual({ removedIds: [], added: files });
		expect(result.task).toBe(afterRemoval);
		expect(result.error).toContain('could not be uploaded');
	});

	it('explains an expired session rather than hiding it behind generic copy', async () => {
		vi.mocked(addTaskImages).mockRejectedValueOnce(new ApiError('Network error', 0));

		const result = await applyImageChanges(1, { removedIds: [], added: [jpeg('a.jpg')] }, TOKEN);

		expect(result.error).toContain('Unable to reach the server');
	});
});
