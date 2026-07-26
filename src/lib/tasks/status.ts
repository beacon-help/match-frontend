import type { TaskStatus } from '$lib/types/task';

// The single source of truth for status pills (Figma: OPEN / PENDING / IN PROGRESS /
// SUCCEEDED / CLOSED). Both `failed` and `cancelled` render as CLOSED.
export function statusBadge(status: TaskStatus): { label: string; classes: string } {
	const map: Record<TaskStatus, { label: string; classes: string }> = {
		open: { label: 'OPEN', classes: 'bg-green-100 border-green-300 text-green-800' },
		pending: { label: 'PENDING', classes: 'bg-gray-100 border-gray-300 text-gray-800' },
		approved: {
			label: 'IN PROGRESS',
			classes: 'bg-yellow-100 border-yellow-300 text-yellow-800'
		},
		succeeded: { label: 'SUCCEEDED', classes: 'bg-blue-100 border-blue-300 text-blue-800' },
		failed: { label: 'CLOSED', classes: 'bg-red-100 border-red-300 text-red-800' },
		cancelled: { label: 'CLOSED', classes: 'bg-red-100 border-red-300 text-red-800' }
	};

	return map[status];
}
