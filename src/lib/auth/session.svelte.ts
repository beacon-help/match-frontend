import { getAccessToken, clearTokens } from '$lib/auth/tokens';
import { getMe, type UserSchema } from '$lib/api/user';
import { ApiError } from '$lib/api/client';

// Reactive auth session shared across the app. A store is warranted here (rather than
// per-component state) because auth state is genuinely shared: the layout loads it, the
// Header reads it to pick its logged-in/out variant, and login/logout mutate it.
let user = $state<UserSchema | null>(null);
let isLoaded = $state(false);

export const session = {
	get user() {
		return user;
	},
	get isLoaded() {
		return isLoaded;
	},
	// Role is authoritative on the backend `user_type`, so it flows in with the session
	// and clears automatically with the user on logout.
	get role() {
		return user?.user_type ?? null;
	}
};

let inflight: Promise<void> | null = null;

async function load(): Promise<void> {
	const token = getAccessToken();
	if (!token) {
		user = null;
		isLoaded = true;
		return;
	}

	try {
		user = await getMe(token);
	} catch (err) {
		// A 401 means the token is expired/invalid — drop it so we stop presenting a session.
		// That answer is authoritative and stays memoised. Anything else (network, 5xx) is
		// transient: clear the memo and rethrow so the next caller retries instead of being
		// stuck with a resolved promise that says "signed out".
		if (err instanceof ApiError && err.status === 401) {
			clearTokens();
			user = null;
		} else {
			inflight = null;
			throw err;
		}
	} finally {
		isLoaded = true;
	}
}

/** Loads the session, reusing an in-flight or completed load. */
export function ensureSession(): Promise<void> {
	return (inflight ??= load());
}

/** Forces a reload, replacing whatever `ensureSession` would have returned. */
export function loadSession(): Promise<void> {
	return (inflight = load());
}

export function endSession(): void {
	clearTokens();
	user = null;
	inflight = null;
}
