import { describe, it, expect } from 'vitest';
import { nextStep } from './nextStep';
import type { Task, TaskStatus } from '$lib/types/task';

function task(status: TaskStatus, withHelper = false): Task {
	return {
		id: 1,
		title: 'Clear mud',
		status,
		location: { address: 'Alzira', lat: 39.15, lon: -0.43 },
		category: 'clean',
		description: '',
		created_at: '2026-11-09T08:12:00',
		updated_at: null,
		owner: { id: 10, first_name: 'Amparo' },
		helper: withHelper ? { id: 20, first_name: 'Lucía' } : null,
		helper_offers: [],
		images: [],
		events: []
	};
}

describe('nextStep', () => {
	it('asks the owner to review an offer', () => {
		expect(nextStep(task('pending', true), 'owner')).toEqual({
			title: 'Lucía has offered to help.',
			text: 'Read the message and decide whether to accept.',
			action: 'review'
		});
	});

	it('tells the owner of an open task that it is visible, with nothing to do', () => {
		const step = nextStep(task('open'), 'owner');

		expect(step?.title).toBe('Your task is visible to volunteers.');
		expect(step?.action).toBeUndefined();
	});

	it('lets either side mark an accepted task done', () => {
		expect(nextStep(task('approved', true), 'owner')?.action).toBe('mark-done');
		expect(nextStep(task('approved', true), 'engaged')).toMatchObject({
			title: 'Amparo accepted your offer.',
			action: 'mark-done'
		});
	});

	it('tells the helper their offer is waiting on the owner', () => {
		expect(nextStep(task('pending', true), 'engaged')).toEqual({
			title: 'Your offer was sent.',
			text: 'Amparo will read it and decide.'
		});
	});

	it('invites other people to offer help only while the task is open', () => {
		expect(nextStep(task('open'), 'public')?.action).toBe('offer-help');
		expect(nextStep(task('pending', true), 'public')).toBeNull();
	});

	it('has nothing to say once a task is finished or closed', () => {
		for (const status of ['succeeded', 'failed', 'cancelled'] as const) {
			expect(nextStep(task(status, true), 'owner')).toBeNull();
			expect(nextStep(task(status, true), 'engaged')).toBeNull();
		}
	});
});
