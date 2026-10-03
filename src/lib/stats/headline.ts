import type { Stats } from '$lib/types/stats';

export type HeadlinePart = { text: string; highlight: boolean };

const numberFormat = new Intl.NumberFormat('en');

function count(n: number, one: string, many: string): string {
	return `${numberFormat.format(n)} ${n === 1 ? one : many}`;
}

function plain(text: string): HeadlinePart {
	return { text, highlight: false };
}

function highlighted(text: string): HeadlinePart {
	return { text, highlight: true };
}

// Wording must never claim more than the numbers prove: not every volunteer completed a
// task, and a registered help seeker has not necessarily been helped.
export function statsHeadline(stats: Stats | null): HeadlinePart[] {
	const completed = stats?.tasks.successful ?? 0;
	const helpers = stats?.users.total_helpers ?? 0;

	if (completed > 0 && helpers > 0) {
		return [
			highlighted(count(completed, 'request', 'requests')),
			plain(' for help completed — and '),
			highlighted(count(helpers, 'volunteer', 'volunteers')),
			plain(' ready for the next one.')
		];
	}
	if (completed > 0) {
		return [highlighted(count(completed, 'request', 'requests')), plain(' for help completed.')];
	}
	if (helpers > 0) {
		return [
			highlighted(count(helpers, 'volunteer', 'volunteers')),
			plain(`${helpers === 1 ? ' is' : ' are'} ready to help people hit by the DANA.`)
		];
	}
	return [plain('Neighbours helping neighbours after the DANA.')];
}

export function statsSubline(stats: Stats | null): string {
	const seekers = stats?.users.total_help_seekers ?? 0;
	if (seekers > 0) {
		return `${count(seekers, 'person has', 'people have')} asked for help here so far — cleanup, food, repairs, a lift and more.`;
	}
	return 'Post what you need — cleanup, food, repairs, a lift — and a nearby volunteer can pick it up.';
}

export function liveLabel(stats: Stats | null): string | null {
	const inProgress = stats?.tasks.in_progress ?? 0;
	if (inProgress === 0) return null;
	return `${count(inProgress, 'task', 'tasks')} underway right now`;
}
