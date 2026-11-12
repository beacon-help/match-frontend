import type { TaskAction, TaskStatus } from '$lib/types/task';
import type { TaskPermission } from '$lib/tasks/permission';

// The button rows on cards, task detail, and My Tasks all derive from this one matrix, so
// the Figma Owner/Engaged/Public × status grid lives in exactly one place.
//
// `kind` identifies the intent so a consumer (TaskActionsBar) can wire the right handler.
// `action` is the real backend `PUT /task/{id}?action=` when the button maps directly to
// one; it is `null` for UI-only intents (navigation or opening a modal that performs the
// call itself). `mock` flags actions with no backend support yet.
export type TaskActionKind =
	| 'see-more'
	| 'edit'
	| 'remove'
	| 'cancel'
	| 'mark-done'
	| 'see-helper'
	| 'see-owner'
	| 'offer-help'
	| 'review'
	| 'contact';

export interface TaskActionSpec {
	kind: TaskActionKind;
	label: string;
	action: TaskAction | null;
	variant: 'primary' | 'neutral' | 'danger';
	mock?: boolean;
}

const SPECS: Record<TaskActionKind, TaskActionSpec> = {
	'see-more': { kind: 'see-more', label: 'See more', action: null, variant: 'neutral' },
	edit: { kind: 'edit', label: 'Edit', action: null, variant: 'neutral' },
	remove: { kind: 'remove', label: 'Remove', action: 'close', variant: 'danger' },
	cancel: { kind: 'cancel', label: 'Cancel offer', action: 'close', variant: 'danger' },
	'mark-done': {
		kind: 'mark-done',
		label: 'Mark done',
		action: 'report_success',
		variant: 'primary'
	},
	'see-helper': { kind: 'see-helper', label: 'See helper', action: null, variant: 'neutral' },
	'see-owner': { kind: 'see-owner', label: 'See owner', action: null, variant: 'neutral' },
	'offer-help': { kind: 'offer-help', label: 'Offer help', action: 'join', variant: 'primary' },
	review: { kind: 'review', label: 'Review request', action: null, variant: 'primary' },
	contact: { kind: 'contact', label: 'Contact', action: null, variant: 'neutral', mock: true }
};

export function actionLabel(kind: TaskActionKind): string {
	return SPECS[kind].label;
}

function pick(kinds: TaskActionKind[]): TaskActionSpec[] {
	return kinds.map((k) => SPECS[k]);
}

export function taskActions(status: TaskStatus, permission: TaskPermission): TaskActionSpec[] {
	if (permission === 'owner') {
		switch (status) {
			case 'open':
				return pick(['see-more', 'edit', 'remove']);
			case 'pending':
				return pick(['review', 'see-more', 'remove']);
			case 'approved':
				return pick(['mark-done', 'see-more', 'see-helper', 'remove']);
			case 'succeeded':
				return pick(['see-more', 'see-helper']);
			case 'failed':
			case 'cancelled':
				return pick(['see-more']);
		}
	}

	if (permission === 'engaged') {
		switch (status) {
			case 'pending':
				return pick(['see-more', 'contact', 'cancel']);
			case 'approved':
				return pick(['mark-done', 'see-more', 'contact']);
			case 'succeeded':
			case 'failed':
			case 'cancelled':
				return pick(['see-more', 'see-owner']);
			default:
				return pick(['see-more']);
		}
	}

	// public
	if (status === 'open') {
		return pick(['offer-help', 'see-more']);
	}
	return pick(['see-more']);
}
