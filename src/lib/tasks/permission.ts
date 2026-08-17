import type { Task } from '$lib/types/task';

// A viewer's relationship to a task, which (together with status) determines the actions
// they may take. Owner = they posted it, engaged = they are the assigned helper, public =
// neither.
export type TaskPermission = 'owner' | 'engaged' | 'public';

export function taskPermission(task: Task, currentUserId: number): TaskPermission {
	if (task.owner.id === currentUserId) {
		return 'owner';
	}
	if (task.helper?.id === currentUserId) {
		return 'engaged';
	}
	return 'public';
}
