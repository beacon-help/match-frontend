import type { TaskEvent, TaskUser } from '$lib/types/task';

function personName(user: TaskUser, viewerId: number): string {
	return user.id === viewerId ? 'You' : user.first_name;
}

function offerOf(helper: TaskUser | null, viewerId: number): string {
	if (!helper) return 'an offer';
	return helper.id === viewerId ? 'your offer' : `${helper.first_name}’s offer`;
}

export function eventSentence(event: TaskEvent, viewerId: number): string {
	const actor = personName(event.actor, viewerId);
	switch (event.type) {
		case 'created':
			return `${actor} posted the task`;
		case 'offered':
			return `${actor} offered help`;
		case 'rejected':
			return `${actor} declined ${offerOf(event.helper, viewerId)}`;
		case 'approved':
			return `${actor} accepted ${offerOf(event.helper, viewerId)}`;
		case 'succeeded':
			return `${actor} marked the task as done`;
		case 'failed':
			return `${actor} marked the task as not done`;
		case 'closed':
			return `${actor} closed the task`;
	}
}

export function canReadEventMessage(event: TaskEvent, ownerId: number, viewerId: number): boolean {
	return viewerId === ownerId || viewerId === event.actor.id;
}

// SQLite drops the offset, so the API sends UTC timestamps without one.
export function parseApiTimestamp(value: string): Date {
	const hasOffset = /(Z|[+-]\d{2}:\d{2})$/.test(value);
	return new Date(hasOffset ? value : `${value}Z`);
}

export function formatEventTime(value: string): string {
	return parseApiTimestamp(value).toLocaleString(undefined, {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});
}
