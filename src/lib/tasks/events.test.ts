import { describe, it, expect } from 'vitest';
import { canReadEventMessage, eventSentence, parseApiTimestamp } from './events';
import type { TaskEvent, TaskUser } from '$lib/types/task';

const adam: TaskUser = { id: 101, first_name: 'Adam' };
const john: TaskUser = { id: 100, first_name: 'John' };
const garry: TaskUser = { id: 103, first_name: 'Garry' };

function event(overrides: Partial<TaskEvent>): TaskEvent {
	return {
		id: 1,
		type: 'created',
		actor: adam,
		helper: null,
		message: null,
		occurred_at: '2026-10-02T09:12:00',
		...overrides
	};
}

describe('eventSentence', () => {
	const rejected = event({ type: 'rejected', actor: adam, helper: john });

	it('uses names for someone outside the task', () => {
		expect(eventSentence(rejected, garry.id)).toBe('Adam declined John’s offer');
	});

	it('uses "You" when the viewer did it', () => {
		expect(eventSentence(rejected, adam.id)).toBe('You declined John’s offer');
	});

	it('uses "your offer" when the viewer is the helper', () => {
		expect(eventSentence(rejected, john.id)).toBe('Adam declined your offer');
	});

	it.each([
		['created', 'You posted the task'],
		['approved', 'You accepted Garry’s offer'],
		['succeeded', 'You marked the task as done'],
		['failed', 'You marked the task as not done'],
		['closed', 'You closed the task']
	] as const)('describes %s events', (type, expected) => {
		expect(eventSentence(event({ type, helper: garry }), adam.id)).toBe(expected);
	});

	it('describes an offer by the viewer', () => {
		const offered = event({ type: 'offered', actor: garry, helper: garry });
		expect(eventSentence(offered, garry.id)).toBe('You offered help');
	});
});

describe('canReadEventMessage', () => {
	const offered = event({ type: 'offered', actor: john, helper: john, message: 'I have a car' });

	it('lets the owner and the author read the message', () => {
		expect(canReadEventMessage(offered, adam.id, adam.id)).toBe(true);
		expect(canReadEventMessage(offered, adam.id, john.id)).toBe(true);
	});

	it('hides the message from everyone else', () => {
		expect(canReadEventMessage(offered, adam.id, garry.id)).toBe(false);
	});
});

describe('parseApiTimestamp', () => {
	it('reads a timestamp without an offset as UTC', () => {
		expect(parseApiTimestamp('2026-10-02T20:08:06.897925').toISOString()).toBe(
			'2026-10-02T20:08:06.897Z'
		);
	});

	it('keeps an explicit offset', () => {
		expect(parseApiTimestamp('2026-10-02T22:08:06+02:00').toISOString()).toBe(
			'2026-10-02T20:08:06.000Z'
		);
	});
});
