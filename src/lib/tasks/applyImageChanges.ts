import { addTaskImages, removeTaskImage } from '$lib/api/task';
import { describeApiError } from '$lib/api/client';
import type { Task } from '$lib/types/task';

export type ImageChanges = {
	/** Ids of stored photos the user removed. */
	removedIds: string[];
	/** Files the user picked but that aren't uploaded yet. */
	added: File[];
};

export type ImageChangeOutcome = {
	/** Latest task from the server, or null if no call got that far. */
	task: Task | null;
	/** Work that still hasn't been applied, ready to be retried. */
	remaining: ImageChanges;
	/**
	 * User-facing message, or null when everything applied. Phrased as a lowercase clause so
	 * callers can prefix it with what else already succeeded.
	 */
	error: string | null;
};

/**
 * Applies queued photo changes to a task that already exists.
 *
 * The backend takes additions and removals one endpoint at a time, so this is a sequence
 * rather than a transaction. Two consequences are handled deliberately:
 *
 * - Removals run before additions, so swapping photos on a task at the cap never trips it.
 * - Each step that succeeds is dropped from `remaining`, so a retry after a partial failure
 *   repeats only the work that's actually outstanding.
 *
 * Every call answers with the full updated task, and the newest one is returned so the
 * caller can refresh what it shows instead of trusting its stale copy.
 */
export async function applyImageChanges(
	taskId: number,
	changes: ImageChanges,
	accessToken: string
): Promise<ImageChangeOutcome> {
	let task: Task | null = null;
	let pendingRemovals = [...changes.removedIds];
	const pendingUploads = [...changes.added];
	let removed = 0;

	for (const imageId of [...pendingRemovals]) {
		try {
			task = await removeTaskImage(taskId, imageId, accessToken);
			pendingRemovals = pendingRemovals.filter((id) => id !== imageId);
			removed += 1;
		} catch (err) {
			const landed = removed > 0 ? ` ${removed} of them went through.` : '';
			return {
				task,
				remaining: { removedIds: pendingRemovals, added: pendingUploads },
				error: `a photo could not be removed.${landed} ${describeApiError(err)}`
			};
		}
	}

	if (pendingUploads.length > 0) {
		try {
			task = await addTaskImages(taskId, pendingUploads, accessToken);
		} catch (err) {
			return {
				task,
				remaining: { removedIds: pendingRemovals, added: pendingUploads },
				error: `the new photos could not be uploaded. ${describeApiError(err)}`
			};
		}
	}

	return { task, remaining: { removedIds: [], added: [] }, error: null };
}
