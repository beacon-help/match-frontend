import { onMount } from 'svelte';
import { getAccessToken } from '$lib/auth/tokens';
import { ensureSession, session } from '$lib/auth/session.svelte';
import { ApiError, describeApiError } from '$lib/api/client';

/**
 * Drives a page that needs a signed-in user: resolves the session, runs the page's own
 * loader alongside it, and exposes the loading/error/sign-in state every authed route
 * renders. `data` and `error` are writable so a page can replace what it loaded (task
 * actions) or report a later failure.
 */
export function createAuthedPage<T>(load?: (token: string) => Promise<T>) {
	let data = $state<T | undefined>(undefined);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let needsSignIn = $state(false);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

		try {
			const [, loaded] = await Promise.all([ensureSession(), load?.(token)]);
			if (!session.user) {
				needsSignIn = true;
				return;
			}
			data = loaded as T;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				needsSignIn = true;
			} else {
				error = describeApiError(err);
			}
		} finally {
			isLoading = false;
		}
	});

	return {
		get data() {
			return data;
		},
		set data(next: T | undefined) {
			data = next;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		set error(next: string | null) {
			error = next;
		},
		get needsSignIn() {
			return needsSignIn;
		}
	};
}
