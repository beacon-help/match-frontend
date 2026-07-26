import { describe, it, expect } from 'vitest';
import { taskActions } from './actions';

describe('taskActions', () => {
	it('lets the public offer help only on open tasks', () => {
		const open = taskActions('open', 'public').map((s) => s.kind);
		expect(open).toContain('offer-help');

		const pending = taskActions('pending', 'public').map((s) => s.kind);
		expect(pending).not.toContain('offer-help');
	});

	it('gives the owner edit/remove on an open task', () => {
		const kinds = taskActions('open', 'owner').map((s) => s.kind);
		expect(kinds).toEqual(expect.arrayContaining(['edit', 'remove']));
	});

	it('lets the owner review a pending request', () => {
		const kinds = taskActions('pending', 'owner').map((s) => s.kind);
		expect(kinds).toContain('review');
	});

	it('maps mark-done to the report_success backend action', () => {
		const spec = taskActions('approved', 'owner').find((s) => s.kind === 'mark-done');
		expect(spec?.action).toBe('report_success');
	});

	it('flags contact as a mock (no backend messaging)', () => {
		const spec = taskActions('approved', 'engaged').find((s) => s.kind === 'contact');
		expect(spec?.mock).toBe(true);
	});

	it('offers only see-more on closed tasks for the public', () => {
		expect(taskActions('failed', 'public').map((s) => s.kind)).toEqual(['see-more']);
		expect(taskActions('cancelled', 'public').map((s) => s.kind)).toEqual(['see-more']);
	});
});
