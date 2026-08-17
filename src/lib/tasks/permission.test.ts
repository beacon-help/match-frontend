import { describe, it, expect } from 'vitest';
import { taskPermission } from './permission';
import type { Task } from '$lib/types/task';

const base: Task = {
	id: 1,
	title: 'Move furniture',
	status: 'open',
	location: { address: 'Valencia', lat: 39.47, lon: -0.38 },
	category: 'transport people',
	description: 'Need help moving',
	created_at: '2026-07-01T00:00:00Z',
	updated_at: null,
	owner: { id: 10, first_name: 'Owner' },
	helper: null
};

describe('taskPermission', () => {
	it('returns owner when the current user owns the task', () => {
		expect(taskPermission(base, 10)).toBe('owner');
	});

	it('returns engaged when the current user is the assigned helper', () => {
		const task: Task = { ...base, helper: { id: 20, first_name: 'Helper' } };
		expect(taskPermission(task, 20)).toBe('engaged');
	});

	it('returns public for an unrelated user', () => {
		expect(taskPermission(base, 99)).toBe('public');
	});

	it('prefers owner over engaged when the same user is both', () => {
		const task: Task = { ...base, helper: { id: 10, first_name: 'Owner' } };
		expect(taskPermission(task, 10)).toBe('owner');
	});
});
