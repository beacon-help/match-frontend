import { apiFetch } from '$lib/api/client';
import type { Stats } from '$lib/types/stats';

export function getStats(): Promise<Stats> {
	return apiFetch<Stats>('/stats/');
}
