import type { Stats } from '$lib/types/stats';

export type Figure = { value: string; label: string };

const numberFormat = new Intl.NumberFormat('en');

const INVITATION =
	'Post what you need — cleanup, food, repairs, a lift — and a nearby volunteer can pick it up.';

function count(n: number, one: string, many: string): string {
	return `${numberFormat.format(n)} ${n === 1 ? one : many}`;
}

// Wording must never claim more than the numbers prove: not every volunteer completed a
// task, and a registered help seeker has not necessarily been helped.
export function statsSentence(stats: Stats | null): string {
	const completed = stats?.tasks.successful ?? 0;
	const helpers = stats?.users.total_helpers ?? 0;

	if (completed > 0 && helpers > 0) {
		return `${count(completed, 'request', 'requests')} for help completed — and ${count(helpers, 'volunteer', 'volunteers')} ready for the next one.`;
	}
	if (completed > 0) {
		return `${count(completed, 'request', 'requests')} for help completed.`;
	}
	if (helpers > 0) {
		return `${count(helpers, 'volunteer', 'volunteers')}${helpers === 1 ? ' is' : ' are'} ready to help people hit by the DANA.`;
	}
	return INVITATION;
}

export function statsFigures(stats: Stats | null): Figure[] {
	if (!stats) return [];

	const figures: [number, string, string][] = [
		[stats.tasks.successful, 'request completed', 'requests completed'],
		[stats.users.total_helpers, 'volunteer signed up', 'volunteers signed up'],
		[stats.users.total_help_seekers, 'person has asked for help', 'people have asked for help'],
		[stats.tasks.in_progress, 'task underway now', 'tasks underway now']
	];

	return figures
		.filter(([n]) => n > 0)
		.map(([n, one, many]) => ({ value: numberFormat.format(n), label: n === 1 ? one : many }));
}
