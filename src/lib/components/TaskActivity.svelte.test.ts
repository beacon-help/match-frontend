import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import TaskActivity from './TaskActivity.svelte';
import type { TaskEvent } from '$lib/types/task';

const adam = { id: 101, first_name: 'Adam' };
const john = { id: 100, first_name: 'John' };

const events: TaskEvent[] = [
	{
		id: 1,
		type: 'created',
		actor: adam,
		helper: null,
		message: null,
		occurred_at: '2026-10-02T09:12:00'
	},
	{
		id: 2,
		type: 'offered',
		actor: john,
		helper: john,
		message: 'I have a car',
		occurred_at: '2026-10-02T10:40:00'
	}
];

describe('TaskActivity', () => {
	it('shows the owner their own actions as "You" and the offer message', () => {
		render(TaskActivity, { props: { events, ownerId: adam.id, viewerId: adam.id } });

		expect(screen.getByText('You posted the task')).toBeInTheDocument();
		expect(screen.getByText('“I have a car”')).toBeInTheDocument();
	});

	it('hides the offer message from someone outside the task', () => {
		render(TaskActivity, { props: { events, ownerId: adam.id, viewerId: 999 } });

		expect(screen.getByText('Adam posted the task')).toBeInTheDocument();
		expect(screen.queryByText('“I have a car”')).not.toBeInTheDocument();
		expect(
			screen.getByText('Message visible to the task owner and the helper')
		).toBeInTheDocument();
	});
});
