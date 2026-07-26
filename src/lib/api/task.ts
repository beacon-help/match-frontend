import { apiFetch } from '$lib/api/client';
import type { PublicTask, Task, TaskAction, TaskCreationRequest } from '$lib/types/task';

export function listPublicTasks(): Promise<PublicTask[]> {
	return apiFetch<PublicTask[]>('/task/public');
}

export function listMyTasks(accessToken: string): Promise<Task[]> {
	return apiFetch<Task[]>('/task/my-tasks', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

// Full task schema (with owner/helper) — used by the authed Search page so each card can
// compute the viewer's permission for its action row.
export function listTasks(accessToken: string): Promise<Task[]> {
	return apiFetch<Task[]>('/task/', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export function getTask(taskId: number, accessToken: string): Promise<Task> {
	return apiFetch<Task>(`/task/${taskId}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export function createTask(body: TaskCreationRequest, accessToken: string): Promise<Task> {
	return apiFetch<Task>('/task/', {
		method: 'POST',
		headers: { Authorization: `Bearer ${accessToken}` },
		body
	});
}

export function manageTask(
	taskId: number,
	action: TaskAction,
	accessToken: string,
	helperId?: number
): Promise<Task> {
	// `approve`/`reject` act on a specific volunteer's request, identified by helper_id.
	const helperParam = helperId != null ? `&helper_id=${helperId}` : '';
	return apiFetch<Task>(`/task/${taskId}?action=${action}${helperParam}`, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

// TODO: backend — there is no task field-update endpoint yet. Edit Task persistence is
// mocked: we resolve with the locally-edited task so the UI flow works end-to-end. Swap this
// for a real `PATCH /task/{id}` call once the backend exposes one.
export function updateTask(task: Task, edits: TaskCreationRequest): Promise<Task> {
	const updated: Task = {
		...task,
		title: edits.title,
		description: edits.description,
		category: edits.category,
		location: edits.location
	};
	return Promise.resolve(updated);
}
