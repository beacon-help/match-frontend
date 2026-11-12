import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import Page from './+page.svelte';
import { setSessionUser } from '$lib/auth/session.svelte';
import type { UserSchema } from '$lib/api/user';
import type { Task } from '$lib/types/task';

const mocks = vi.hoisted(() => ({
	getTask: vi.fn(),
	manageTask: vi.fn(),
	getAccessToken: vi.fn(),
	viewer: { current: null as unknown },
	location: { params: { id: '1' }, url: new URL('http://localhost/tasks/1') }
}));

vi.mock('$app/state', () => ({ page: mocks.location }));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$lib/map/createMap', () => ({ createMap: async () => null }));
vi.mock('$lib/auth/tokens', () => ({
	getAccessToken: mocks.getAccessToken,
	clearTokens: vi.fn()
}));
vi.mock('$lib/api/task', () => ({ getTask: mocks.getTask, manageTask: mocks.manageTask }));
vi.mock('$lib/api/user', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/api/user')>()),
	getMe: async () => mocks.viewer.current
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

function task(overrides: Partial<Task> = {}): Task {
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

const pending = task({
	status: 'pending',
	helper,
	helper_offers: [{ user_id: 20, offered_at: '2026-11-09T10:40:00', message: OFFER }]
});

function signInAs(user: UserSchema) {
	mocks.viewer.current = user;
	setSessionUser(user);
}

beforeEach(() => {
	mocks.getAccessToken.mockReturnValue('tok');
	mocks.getTask.mockReset();
	mocks.manageTask.mockReset();
});

describe('/tasks/[id]', () => {
	it('asks a signed-out visitor to sign in', async () => {
		mocks.getAccessToken.mockReturnValue(null);
		render(Page);

		expect(await screen.findByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/login');
		expect(mocks.getTask).not.toHaveBeenCalled();
	});

	it('shows the owner an offer once, in the next-step box', async () => {
		signInAs(amparo);
		mocks.getTask.mockResolvedValue(pending);
		render(Page);

		expect(
			await screen.findByRole('heading', { level: 1, name: pending.title })
		).toBeInTheDocument();
		expect(screen.getByText('Offer received')).toBeInTheDocument();
		expect(screen.getByText('Lucía has offered to help.')).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: 'Review request' })).toHaveLength(1);
		expect(screen.getByRole('link', { name: '‹ Back to my tasks' })).toHaveAttribute(
			'href',
			'/tasks'
		);
		expect(mocks.getTask).toHaveBeenCalledWith(1, 'tok');
	});

	it('lets the owner accept the offer from the next-step box', async () => {
		signInAs(amparo);
		mocks.getTask.mockResolvedValue(pending);
		mocks.manageTask.mockResolvedValue({ ...pending, status: 'approved' });
		render(Page);

		await fireEvent.click(await screen.findByRole('button', { name: 'Review request' }));
		expect(screen.getByRole('dialog', { name: 'Review request' })).toHaveTextContent(OFFER);

		await fireEvent.click(screen.getByRole('button', { name: 'Accept' }));

		await waitFor(() => expect(screen.getByText('In progress')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(1, 'approve', 'tok', 20);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.getByText('Lucía is helping with this task.')).toBeInTheDocument();
	});

	it('lets the owner mark an accepted task done, which clears the box', async () => {
		signInAs(amparo);
		const approved = task({ status: 'approved', helper });
		mocks.getTask.mockResolvedValue(approved);
		mocks.manageTask.mockResolvedValue({ ...approved, status: 'succeeded' });
		render(Page);

		await fireEvent.click(await screen.findByRole('button', { name: 'Mark done' }));

		await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(1, 'report_success', 'tok');
		expect(screen.queryByText('Lucía is helping with this task.')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Mark done' })).not.toBeInTheDocument();
	});

	it('lets a volunteer send an offer on an open task', async () => {
		signInAs(lucia);
		const open = task();
		mocks.getTask.mockResolvedValue(open);
		mocks.manageTask.mockResolvedValue({ ...pending });
		render(Page);

		expect(await screen.findByText('Amparo is looking for help.')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: '‹ Back to task search' })).toHaveAttribute(
			'href',
			'/tasks/search'
		);

		await fireEvent.click(screen.getByRole('button', { name: 'Offer help' }));
		await fireEvent.input(screen.getByLabelText('Your message'), { target: { value: OFFER } });
		await fireEvent.click(screen.getByRole('button', { name: 'Send offer' }));

		await waitFor(() => expect(screen.getByText('Offer sent')).toBeInTheDocument());
		expect(mocks.manageTask).toHaveBeenCalledWith(1, 'join', 'tok', undefined, OFFER);
		expect(screen.getByText('Your offer was sent.')).toBeInTheDocument();
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('keeps the pop-up open and shows the reason when an offer fails', async () => {
		signInAs(lucia);
		mocks.getTask.mockResolvedValue(task());
		mocks.manageTask.mockRejectedValue(new Error('boom'));
		render(Page);

		await fireEvent.click(await screen.findByRole('button', { name: 'Offer help' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Send offer' }));

		await waitFor(() => expect(mocks.manageTask).toHaveBeenCalled());
		expect(await screen.findByRole('dialog', { name: 'Offer help' })).toHaveTextContent(
			'Something went wrong, please try again.'
		);
		expect(screen.getByText('Open')).toBeInTheDocument();
	});
});
