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
	helperId?: number,
	message?: string
): Promise<Task> {
	const params = new URLSearchParams({ action });
	// `approve`/`reject` act on a specific volunteer's request, identified by helper_id.
	if (helperId != null) params.set('helper_id', String(helperId));
	// Required by the backend for `join` — becomes the volunteer's helper_offer message.
	if (message != null) params.set('message', message);
	return apiFetch<Task>(`/task/${taskId}/manage?${params}`, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

// Images live outside the task body: neither POST /task/ nor PUT /task/{id}/edit accepts
// them, so uploads always target an existing task. Both endpoints return the full updated
// task, so callers can replace their local copy wholesale.
export function addTaskImages(taskId: number, files: File[], accessToken: string): Promise<Task> {
	const form = new FormData();
	for (const file of files) {
		form.append('images', file);
	}
	return apiFetch<Task>(`/task/${taskId}/images`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${accessToken}` },
		body: form
	});
}

export function removeTaskImage(
	taskId: number,
	imageId: string,
	accessToken: string
): Promise<Task> {
	return apiFetch<Task>(`/task/${taskId}/images/${encodeURIComponent(imageId)}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export function updateTask(
	taskId: number,
	edits: TaskCreationRequest,
	accessToken: string
): Promise<Task> {
	return apiFetch<Task>(`/task/${taskId}/edit`, {
		method: 'PUT',
		headers: { Authorization: `Bearer ${accessToken}` },
		body: edits
	});
}
