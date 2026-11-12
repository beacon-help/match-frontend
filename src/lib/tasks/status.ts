import type { TaskStatus } from '$lib/types/task';
import type { TagTone } from '$lib/types/tag';
import type { TaskPermission } from '$lib/tasks/permission';

const PENDING_LABEL: Record<TaskPermission, string> = {
	owner: 'Offer received',
	engaged: 'Offer sent',
	public: 'Offer pending'
};

export function statusBadge(
	status: TaskStatus,
	permission: TaskPermission = 'public'
): { label: string; tone: TagTone } {
	switch (status) {
		case 'open':
			return { label: 'Open', tone: 'navy' };
		case 'pending':
			return { label: PENDING_LABEL[permission], tone: 'wait' };
		case 'approved':
			return { label: 'In progress', tone: 'ok' };
		case 'succeeded':
			return { label: 'Done', tone: 'ok' };
		case 'failed':
		case 'cancelled':
			return { label: 'Closed', tone: 'neutral' };
	}
}
