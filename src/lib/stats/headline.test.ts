import { describe, it, expect } from 'vitest';
import { liveLabel, statsHeadline, statsSubline } from './headline';
import type { Stats } from '$lib/types/stats';

function stats(tasks: Partial<Stats['tasks']> = {}, users: Partial<Stats['users']> = {}): Stats {
	return {
		tasks: { total: 0, successful: 0, in_progress: 0, ...tasks },
		users: { total_helpers: 0, total_help_seekers: 0, ...users }
	};
}

const text = (parts: { text: string }[]) => parts.map((p) => p.text).join('');

describe('statsHeadline', () => {
	it('names completed requests and volunteers, highlighting both counts', () => {
		const parts = statsHeadline(stats({ successful: 128 }, { total_helpers: 1312 }));

		expect(text(parts)).toBe(
			'128 requests for help completed — and 1,312 volunteers ready for the next one.'
		);
		expect(parts.filter((p) => p.highlight).map((p) => p.text)).toEqual([
			'128 requests',
			'1,312 volunteers'
		]);
	});

	it('uses singular nouns for a count of one', () => {
		expect(text(statsHeadline(stats({ successful: 1 }, { total_helpers: 1 })))).toBe(
			'1 request for help completed — and 1 volunteer ready for the next one.'
		);
	});

	it('leads with volunteers before any task is completed', () => {
		expect(text(statsHeadline(stats({}, { total_helpers: 14 })))).toBe(
			'14 volunteers are ready to help people hit by the DANA.'
		);
		expect(text(statsHeadline(stats({}, { total_helpers: 1 })))).toBe(
			'1 volunteer is ready to help people hit by the DANA.'
		);
	});

	it('mentions only completed requests when there are no volunteers', () => {
		expect(text(statsHeadline(stats({ successful: 3 })))).toBe('3 requests for help completed.');
	});

	it('falls back to a number-free headline when everything is zero or stats are missing', () => {
		const expected = 'Neighbours helping neighbours after the DANA.';
		expect(text(statsHeadline(stats()))).toBe(expected);
		expect(text(statsHeadline(null))).toBe(expected);
	});
});

describe('statsSubline', () => {
	it('counts the people who asked for help', () => {
		expect(statsSubline(stats({}, { total_help_seekers: 97 }))).toMatch(
			/^97 people have asked for help here so far/
		);
		expect(statsSubline(stats({}, { total_help_seekers: 1 }))).toMatch(
			/^1 person has asked for help/
		);
	});

	it('invites a first request when nobody has asked yet', () => {
		expect(statsSubline(null)).toMatch(/^Post what you need/);
	});
});

describe('liveLabel', () => {
	it('counts tasks underway', () => {
		expect(liveLabel(stats({ in_progress: 41 }))).toBe('41 tasks underway right now');
		expect(liveLabel(stats({ in_progress: 1 }))).toBe('1 task underway right now');
	});

	it('is null when nothing is underway', () => {
		expect(liveLabel(stats())).toBeNull();
		expect(liveLabel(null)).toBeNull();
	});
});
