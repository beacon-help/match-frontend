import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import Page from './+page.svelte';
import { setSessionUser } from '$lib/auth/session.svelte';
import type { UserSchema } from '$lib/api/user';
import type { Task } from '$lib/types/task';

const mocks = vi.hoisted(() => ({
	listMyTasks: vi.fn(),
	manageTask: vi.fn(),
	getUser: vi.fn(),
	goto: vi.fn(),
	getAccessToken: vi.fn(),
	viewer: { current: null as unknown }
}));

vi.mock('$app/navigation', () => ({ goto: mocks.goto }));
vi.mock('$lib/auth/tokens', () => ({
	getAccessToken: mocks.getAccessToken,
	clearTokens: vi.fn()
}));
vi.mock('$lib/api/task', () => ({
	listMyTasks: mocks.listMyTasks,
	manageTask: mocks.manageTask
}));
vi.mock('$lib/api/user', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/api/user')>()),
	getMe: async () => mocks.viewer.current,
	getUser: mocks.getUser
}));

const amparo: UserSchema = {
	id: 10,
	first_name: 'Amparo',
	last_name: 'García',
	email: 'amparo@example.com',
	is_verified: true,
	user_type: 'help-seeker',
	properties: []
};
const lucia: UserSchema = {
	id: 20,
	first_name: 'Lucía',
	last_name: 'Martí',
	email: 'lucia@example.com',
	is_verified: true,
	user_type: 'volunteer',
	properties: []
};
const helper = { id: 20, first_name: 'Lucía' };
const OFFER = 'I can come on Saturday with buckets.';

function task(overrides: Partial<Task>): Task {
	return {
		id: 1,
		title: 'Clear mud from a ground-floor flat',
		status: 'open',
		location: { address: 'Carrer de Sant Roc 12, Alzira', lat: 39.151, lon: -0.435 },
		category: 'clean',
		description: 'The water reached about a metre.',
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

const mud = task({
	status: 'pending',
	helper,
	helper_offers: [{ user_id: 20, offered_at: '2026-11-09T10:40:00', message: OFFER }]
});
const lift = task({ id: 2, title: 'A lift to the health centre', status: 'approved', helper });
const clothes = task({ id: 3, title: 'Winter clothes for two children' });

function row(title: string): HTMLElement {
	return screen.getByRole('link', { name: title }).closest('li')!;
}

function signInAs(user: UserSchema) {
	mocks.viewer.current = user;
	setSessionUser(user);
}

beforeEach(() => {
	mocks.getAccessToken.mockReturnValue('tok');
	mocks.listMyTasks.mockReset().mockResolvedValue([mud, lift, clothes]);
	mocks.manageTask.mockReset();
	mocks.getUser.mockReset();
	mocks.goto.mockReset();
	signInAs(amparo);
});

describe('/tasks', () => {
	it('asks a signed-out visitor to sign in', async () => {
		mocks.getAccessToken.mockReturnValue(null);
		render(Page);

		expect(await screen.findByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/login');
		expect(mocks.listMyTasks).not.toHaveBeenCalled();
	});

	it('lists a help seeker’s tasks with their status and a way to ask for more help', async () => {
		render(Page);

		expect(await screen.findByRole('link', { name: mud.title })).toHaveAttribute(
			'href',
			'/tasks/1'
		);
		expect(within(row(mud.title)).getByText('Offer received')).toBeInTheDocument();
		expect(within(row(lift.title)).getByText('In progress')).toBeInTheDocument();
		expect(within(row(clothes.title)).getByText('Open')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Ask for help' })).toHaveAttribute(
			'href',
			'/tasks/create'
		);
		expect(screen.queryByRole('button', { name: 'See more' })).not.toBeInTheDocument();
		expect(mocks.listMyTasks).toHaveBeenCalledWith('tok');
	});

	it('tells a help seeker with no tasks how to start', async () => {
		mocks.listMyTasks.mockResolvedValue([]);
		render(Page);

		expect(await screen.findByText(/You haven't created any tasks yet/)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Ask for help' })).toBeInTheDocument();
	});

	it('points a volunteer with no tasks to the task search', async () => {
		signInAs(lucia);
		mocks.listMyTasks.mockResolvedValue([]);
		render(Page);

		expect(
			await screen.findByText(/You haven't offered to help with any tasks yet/)
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Find a task' })).toHaveAttribute(
			'href',
			'/tasks/search'
		);
	});

	it('lets the owner accept an offer, updating only that row', async () => {
		mocks.manageTask.mockResolvedValue({ ...mud, status: 'approved' });
		render(Page);
		await screen.findByRole('link', { name: mud.title });

		await fireEvent.click(within(row(mud.title)).getByRole('button', { name: 'Review request' }));
		expect(screen.getByRole('dialog', { name: 'Review request' })).toHaveTextContent(OFFER);

		await fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

		await waitFor(() =>
			expect(within(row(mud.title)).getByText('In progress')).toBeInTheDocument()
		);
		expect(mocks.manageTask).toHaveBeenCalledWith(1, 'approve', 'tok', 20);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(within(row(clothes.title)).getByText('Open')).toBeInTheDocument();
	});

	it('lets the owner decline an offer', async () => {
		mocks.manageTask.mockResolvedValue({ ...mud, status: 'open', helper: null });
		render(Page);
		await screen.findByRole('link', { name: mud.title });

		await fireEvent.click(within(row(mud.title)).getByRole('button', { name: 'Review request' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Reject' }));

		await waitFor(() => expect(within(row(mud.title)).getByText('Open')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(1, 'reject', 'tok', 20);
	});

	it('marks a task done from its row', async () => {
		mocks.manageTask.mockResolvedValue({ ...lift, status: 'succeeded' });
		render(Page);
		await screen.findByRole('link', { name: lift.title });

		await fireEvent.click(within(row(lift.title)).getByRole('button', { name: 'Mark done' }));

		await waitFor(() => expect(within(row(lift.title)).getByText('Done')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(2, 'report_success', 'tok');
	});

	it('removes a task from its row, leaving it Closed', async () => {
		mocks.manageTask.mockResolvedValue({ ...clothes, status: 'cancelled' });
		render(Page);
		await screen.findByRole('link', { name: clothes.title });

		await fireEvent.click(within(row(clothes.title)).getByRole('button', { name: 'Remove' }));

		await waitFor(() => expect(within(row(clothes.title)).getByText('Closed')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(3, 'close', 'tok');
	});

	it('opens the edit page for an open task', async () => {
		render(Page);
		await screen.findByRole('link', { name: clothes.title });

		await fireEvent.click(within(row(clothes.title)).getByRole('button', { name: 'Edit' }));

		expect(mocks.goto).toHaveBeenCalledWith('/tasks/3/edit');
	});

	it('shows the helper’s profile', async () => {
		mocks.getUser.mockResolvedValue({ id: 20, user_type: 'volunteer', first_name: 'Lucía' });
		render(Page);
		await screen.findByRole('link', { name: lift.title });

		await fireEvent.click(within(row(lift.title)).getByRole('button', { name: 'See helper' }));

		const dialog = await screen.findByRole('dialog', { name: 'Profile' });
		expect(await within(dialog).findByText('Lucía')).toBeInTheDocument();
		expect(mocks.getUser).toHaveBeenCalledWith(20, 'tok');
	});

	it('words a volunteer’s pending offer from their side and lets them cancel it', async () => {
		signInAs(lucia);
		mocks.listMyTasks.mockResolvedValue([mud]);
		mocks.manageTask.mockResolvedValue({ ...mud, status: 'cancelled' });
		render(Page);

		expect(await screen.findByText('Offer sent')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Review request' })).not.toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Cancel offer' }));

		await waitFor(() => expect(mocks.manageTask).toHaveBeenCalledWith(1, 'close', 'tok'));
	});

	it('reports a failed action', async () => {
		mocks.manageTask.mockRejectedValue(new Error('boom'));
		render(Page);
		await screen.findByRole('link', { name: clothes.title });

		await fireEvent.click(within(row(clothes.title)).getByRole('button', { name: 'Remove' }));

		expect(await screen.findByText('Something went wrong, please try again.')).toBeInTheDocument();
	});
});
