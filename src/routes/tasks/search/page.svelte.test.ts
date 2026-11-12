import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import Page from './+page.svelte';
import { setSessionUser } from '$lib/auth/session.svelte';
import type { UserSchema } from '$lib/api/user';
import type { Task } from '$lib/types/task';

const mocks = vi.hoisted(() => ({
	listTasks: vi.fn(),
	manageTask: vi.fn(),
	getAccessToken: vi.fn(),
	viewer: { current: null as unknown }
}));

vi.mock('$lib/map/createMap', () => ({ createMap: async () => null }));
vi.mock('$lib/auth/tokens', () => ({
	getAccessToken: mocks.getAccessToken,
	clearTokens: vi.fn()
}));
vi.mock('$lib/api/task', () => ({ listTasks: mocks.listTasks, manageTask: mocks.manageTask }));
vi.mock('$lib/api/user', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/api/user')>()),
	getMe: async () => mocks.viewer.current
}));

const lucia: UserSchema = {
	id: 20,
	first_name: 'Lucía',
	last_name: 'Martí',
	email: 'lucia@example.com',
	is_verified: true,
	user_type: 'volunteer',
	properties: []
};

function task(overrides: Partial<Task>): Task {
	return {
		id: 1,
		title: 'Clear mud from a ground-floor flat',
		status: 'open',
		location: { address: 'Carrer de Sant Roc 12, Alzira', lat: 39.151, lon: -0.435 },
		category: 'clean',
		description: '',
		created_at: '2026-11-09T08:12:00',
		updated_at: null,
		owner: { id: 10, first_name: 'Amparo' },
		helper: null,
		helper_offers: [],
		images: [],
		events: [],
		...overrides
	};
}

// Alzira is about 36 km from the search centre in Valencia; Torrent about 8 km.
const mud = task({});
const door = task({
	id: 6,
	title: 'Rehang a front door',
	category: 'repair',
	location: { address: 'Avinguda al Vedat 41, Torrent', lat: 39.4405, lon: -0.458 }
});

function row(title: string): HTMLElement {
	return screen.getByRole('link', { name: title }).closest('li')!;
}

beforeEach(() => {
	mocks.getAccessToken.mockReturnValue('tok');
	mocks.viewer.current = lucia;
	setSessionUser(lucia);
	mocks.listTasks.mockReset().mockResolvedValue([mud, door]);
	mocks.manageTask.mockReset();
});

describe('/tasks/search', () => {
	it('asks a signed-out visitor to sign in', async () => {
		mocks.getAccessToken.mockReturnValue(null);
		render(Page);

		expect(await screen.findByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/login');
		expect(mocks.listTasks).not.toHaveBeenCalled();
	});

	it('lists each task as a link to its page, with a count', async () => {
		render(Page);

		expect(await screen.findByRole('heading', { name: '2 tasks match' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: mud.title })).toHaveAttribute('href', '/tasks/1');
		expect(screen.getByRole('link', { name: door.title })).toHaveAttribute('href', '/tasks/6');
		expect(
			within(row(door.title)).getByText('Repairs · Avinguda al Vedat 41, Torrent')
		).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'See more' })).not.toBeInTheDocument();
	});

	it('narrows the list to the ticked kinds of help', async () => {
		render(Page);
		await screen.findByRole('heading', { name: '2 tasks match' });

		await fireEvent.click(screen.getByLabelText('Repairs'));

		expect(screen.getByRole('heading', { name: '1 task matches' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: door.title })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: mud.title })).not.toBeInTheDocument();
	});

	it('drops tasks outside the chosen distance', async () => {
		render(Page);
		await screen.findByRole('heading', { name: '2 tasks match' });

		await fireEvent.input(screen.getByLabelText('Within 50 km'), { target: { value: '10' } });

		expect(screen.getByLabelText('Within 10 km')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: door.title })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: mud.title })).not.toBeInTheDocument();
	});

	it('says so when nothing matches', async () => {
		render(Page);
		await screen.findByRole('heading', { name: '2 tasks match' });

		await fireEvent.click(screen.getByLabelText('Food'));

		expect(screen.getByRole('heading', { name: '0 tasks match' })).toBeInTheDocument();
		expect(screen.getByText('No tasks match your filters.')).toBeInTheDocument();
	});

	it('switches the filter button between Show and Hide', async () => {
		render(Page);

		await fireEvent.click(await screen.findByRole('button', { name: 'Show filters' }));
		expect(screen.getByRole('button', { name: 'Hide filters' })).toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Hide filters' }));
		expect(screen.getByRole('button', { name: 'Show filters' })).toBeInTheDocument();
	});

	it('sends an offer from a row and updates only that row', async () => {
		mocks.manageTask.mockResolvedValue({
			...door,
			status: 'pending',
			helper: { id: 20, first_name: 'Lucía' }
		});
		render(Page);
		await screen.findByRole('heading', { name: '2 tasks match' });

		await fireEvent.click(within(row(door.title)).getByRole('button', { name: 'Offer help' }));
		await fireEvent.input(screen.getByLabelText('Your message'), {
			target: { value: 'I have tools.' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Send offer' }));

		await waitFor(() =>
			expect(within(row(door.title)).getByText('Offer sent')).toBeInTheDocument()
		);
		expect(mocks.manageTask).toHaveBeenCalledWith(6, 'join', 'tok', undefined, 'I have tools.');
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(within(row(mud.title)).getByText('Open')).toBeInTheDocument();
	});
});
