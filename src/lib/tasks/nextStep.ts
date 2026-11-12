import type { Task } from '$lib/types/task';
import type { TaskPermission } from '$lib/tasks/permission';
import type { TaskActionKind } from '$lib/tasks/actions';

export type NextStep = { title: string; text: string; action?: TaskActionKind };

function ownerStep(task: Task, helper: string): NextStep | null {
	switch (task.status) {
		case 'open':
			return {
				title: 'Your task is visible to volunteers.',
				text: 'You will see their message here when someone offers to help.'
			};
		case 'pending':
			return {
				title: `${helper} has offered to help.`,
				text: 'Read the message and decide whether to accept.',
				action: 'review'
			};
		case 'approved':
			return {
				title: `${helper} is helping with this task.`,
				text: 'Mark it done once the help is finished.',
				action: 'mark-done'
			};
		default:
			return null;
	}
}

function helperStep(task: Task): NextStep | null {
	const owner = task.owner.first_name;
	switch (task.status) {
		case 'pending':
			return { title: 'Your offer was sent.', text: `${owner} will read it and decide.` };
		case 'approved':
			return {
				title: `${owner} accepted your offer.`,
				text: 'Mark the task done once you have helped.',
				action: 'mark-done'
			};
		default:
			return null;
	}
}

export function nextStep(task: Task, permission: TaskPermission): NextStep | null {
	if (permission === 'owner') {
		return ownerStep(task, task.helper?.first_name ?? 'A volunteer');
	}
	if (permission === 'engaged') {
		return helperStep(task);
	}
	if (task.status === 'open') {
		return {
			title: `${task.owner.first_name} is looking for help.`,
			text: 'If you can take this on, send an offer with a short message.',
			action: 'offer-help'
		};
	}
	return null;
}
