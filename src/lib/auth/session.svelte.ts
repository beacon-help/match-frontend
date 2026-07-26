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

export async function loadSession(): Promise<void> {
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
		if (err instanceof ApiError && err.status === 401) {
			clearTokens();
			user = null;
		}
	} finally {
		isLoaded = true;
	}
}

export function endSession(): void {
	clearTokens();
	user = null;
}
