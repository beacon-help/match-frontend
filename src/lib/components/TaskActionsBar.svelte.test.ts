import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import TaskActionsBar from './TaskActionsBar.svelte';
import type { Task } from '$lib/types/task';

const task: Task = {
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
	images: []
};

describe('TaskActionsBar', () => {
	it('renders the owner row for an open task', () => {
		render(TaskActionsBar, { task, permission: 'owner' });

		expect(screen.getByText('See more')).toBeInTheDocument();
		expect(screen.getByText('Edit')).toBeInTheDocument();
		expect(screen.getByText('Remove')).toBeInTheDocument();
	});

	it('hides See more when asked', () => {
		render(TaskActionsBar, { task, permission: 'owner', hideSeeMore: true });

		expect(screen.queryByText('See more')).not.toBeInTheDocument();
		expect(screen.getByText('Edit')).toBeInTheDocument();
	});

	it('fires the handler for the matching action', async () => {
		const onEdit = vi.fn();
		render(TaskActionsBar, { task, permission: 'owner', onEdit });

		screen.getByText('Edit').click();

		expect(onEdit).toHaveBeenCalledOnce();
	});

	it('disables a button with no handler', () => {
		render(TaskActionsBar, { task, permission: 'owner' });

		expect(screen.getByText('Edit').closest('button')).toBeDisabled();
	});

	it('disables every button while busy', () => {
		render(TaskActionsBar, { task, permission: 'owner', busy: true, onEdit: vi.fn() });

		expect(screen.getByText('Edit').closest('button')).toBeDisabled();
	});

	// Contact has no backend endpoint yet, so it renders but can never be actioned.
	it('renders Contact disabled for an engaged helper', () => {
		const engaged: Task = { ...task, status: 'pending', helper: { id: 20, first_name: 'H' } };
		render(TaskActionsBar, { task: engaged, permission: 'engaged' });

		expect(screen.getByText('Contact').closest('button')).toBeDisabled();
	});
});
