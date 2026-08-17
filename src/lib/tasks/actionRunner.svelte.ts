import { manageTask } from '$lib/api/task';
import { getAccessToken } from '$lib/auth/tokens';
import { describeApiError } from '$lib/api/client';
import { saveOfferMessage } from '$lib/tasks/offerMessages';
import type { Task } from '$lib/types/task';

// Shared by every page that mutates a task via `PUT /task/{id}/manage` (My Tasks, Search,
// task detail): tracks the shared busy flag for the in-flight call, calls `replace` to merge
// the result back into the page's own shape (a list vs. a single task), and reports failures
// through the caller-supplied `onError` so each page keeps routing them to its own state
// (a full-page error vs. an inline one next to a modal).
export function createTaskActionRunner(replace: (updated: Task) => void) {
	let busy = $state(false);

	async function run(
		fn: (token: string) => Promise<Task>,
		onError: (message: string) => void
	): Promise<Task | undefined> {
		const token = getAccessToken();
		if (!token) return undefined;
		busy = true;
		try {
			const updated = await fn(token);
			replace(updated);
			return updated;
		} catch (err) {
			onError(describeApiError(err));
			return undefined;
		} finally {
			busy = false;
		}
	}

	function runAction(
		task: Task,
		action: 'close' | 'report_success',
		onError: (message: string) => void
	) {
		return run((token) => manageTask(task.id, action, token), onError);
	}

	async function submitOffer(task: Task, message: string, onError: (message: string) => void) {
		const updated = await run((token) => manageTask(task.id, 'join', token), onError);
		if (updated) saveOfferMessage(task.id, message); // mock-persist (no backend field)
		return updated;
	}

	function reviewDecision(
		task: Task,
		action: 'approve' | 'reject',
		onError: (message: string) => void
	) {
		return run((token) => manageTask(task.id, action, token, task.helper?.id), onError);
	}

	return {
		get busy() {
			return busy;
		},
		runAction,
		submitOffer,
		reviewDecision
	};
}
