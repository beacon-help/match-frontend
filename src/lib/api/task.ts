import { apiFetch } from '$lib/api/client';
import type { PublicTask } from '$lib/types/task';

export function listPublicTasks(): Promise<PublicTask[]> {
	return apiFetch<PublicTask[]>('/task/public');
}
