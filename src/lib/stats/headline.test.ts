import { describe, it, expect } from 'vitest';
import { statsFigures, statsSentence } from './headline';
import type { Stats } from '$lib/types/stats';

function stats(tasks: Partial<Stats['tasks']> = {}, users: Partial<Stats['users']> = {}): Stats {
	return {
		tasks: { total: 0, successful: 0, in_progress: 0, ...tasks },
		users: { total_helpers: 0, total_help_seekers: 0, ...users }
	};
}

describe('statsSentence', () => {
	it('names completed requests and volunteers', () => {
		expect(statsSentence(stats({ successful: 128 }, { total_helpers: 1312 }))).toBe(
			'128 requests for help completed — and 1,312 volunteers ready for the next one.'
		);
	});

	it('uses singular nouns for a count of one', () => {
		expect(statsSentence(stats({ successful: 1 }, { total_helpers: 1 }))).toBe(
			'1 request for help completed — and 1 volunteer ready for the next one.'
		);
	});

	it('leads with volunteers before any task is completed', () => {
		expect(statsSentence(stats({}, { total_helpers: 14 }))).toBe(
			'14 volunteers are ready to help people hit by the DANA.'
		);
		expect(statsSentence(stats({}, { total_helpers: 1 }))).toBe(
			'1 volunteer is ready to help people hit by the DANA.'
		);
	});

	it('mentions only completed requests when there are no volunteers', () => {
		expect(statsSentence(stats({ successful: 3 }))).toBe('3 requests for help completed.');
	});

	it('invites a first request when everything is zero or stats are missing', () => {
		expect(statsSentence(stats())).toMatch(/^Post what you need/);
		expect(statsSentence(null)).toMatch(/^Post what you need/);
	});
});

describe('statsFigures', () => {
	it('lists every count that is above zero', () => {
		const figures = statsFigures(
			stats({ successful: 1280, in_progress: 41 }, { total_helpers: 312, total_help_seekers: 97 })
		);

		expect(figures).toEqual([
			{ value: '1,280', label: 'requests completed' },
			{ value: '312', label: 'volunteers signed up' },
			{ value: '97', label: 'people have asked for help' },
			{ value: '41', label: 'tasks underway now' }
		]);
	});

	it('uses singular labels for a count of one', () => {
		const figures = statsFigures(
			stats({ successful: 1, in_progress: 1 }, { total_helpers: 1, total_help_seekers: 1 })
		);

		expect(figures.map((figure) => figure.label)).toEqual([
			'request completed',
			'volunteer signed up',
			'person has asked for help',
			'task underway now'
		]);
	});

	it('leaves out zero counts and is empty without stats', () => {
		expect(statsFigures(stats({ successful: 3 }))).toEqual([
			{ value: '3', label: 'requests completed' }
		]);
		expect(statsFigures(null)).toEqual([]);
	});
});
