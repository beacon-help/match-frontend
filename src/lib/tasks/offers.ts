import type { Task } from '$lib/types/task';

// A volunteer can join, get rejected, and rejoin, appending a new offer each time — the
// last matching entry is the one relevant to the task's current `helper`.
export function helperOfferMessage(task: Task, userId: number | null | undefined): string | null {
	if (userId == null) return null;
	const offers = task.helper_offers.filter((offer) => offer.user_id === userId);
	return offers.at(-1)?.message ?? null;
}
