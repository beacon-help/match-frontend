import { apiFetch } from '$lib/api/client';
import type { PublicTask, Task, TaskAction } from '$lib/types/task';

export function listPublicTasks(): Promise<PublicTask[]> {
	return apiFetch<PublicTask[]>('/task/public');
}

export function listMyTasks(accessToken: string): Promise<Task[]> {
	return apiFetch<Task[]>('/task/my-tasks', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export function manageTask(taskId: number, action: TaskAction, accessToken: string): Promise<Task> {
	return apiFetch<Task>(`/task/${taskId}?action=${action}`, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}
