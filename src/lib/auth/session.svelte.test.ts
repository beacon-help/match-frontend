import { describe, it, expect, vi, beforeEach } from 'vitest';

const getMe = vi.fn();
const getAccessToken = vi.fn();
const clearTokens = vi.fn();

vi.mock('$lib/api/user', () => ({ getMe: (t: string) => getMe(t) }));
vi.mock('$lib/auth/tokens', () => ({
	getAccessToken: () => getAccessToken(),
	clearTokens: () => clearTokens()
}));

// resetModules gives the session module a fresh `inflight`, so ApiError has to come from
// the same registry or `instanceof` fails against the module's own copy.
async function freshModule() {
	vi.resetModules();
	const { ApiError } = await import('$lib/api/client');
	return { ...(await import('./session.svelte')), ApiError };
}

const alice = { id: 1, first_name: 'Alice', last_name: 'A', email: 'a@b.c', is_verified: true };

beforeEach(() => {
	vi.clearAllMocks();
	getAccessToken.mockReturnValue('tok');
	getMe.mockResolvedValue(alice);
});

describe('ensureSession', () => {
	it('fetches the profile once across repeated calls', async () => {
		const { ensureSession, session } = await freshModule();

		await Promise.all([ensureSession(), ensureSession()]);
		await ensureSession();

		expect(getMe).toHaveBeenCalledTimes(1);
		expect(session.user).toEqual(alice);
		expect(session.isLoaded).toBe(true);
	});

	it('does not call the API without a token', async () => {
		getAccessToken.mockReturnValue(null);
		const { ensureSession, session } = await freshModule();

		await ensureSession();

		expect(getMe).not.toHaveBeenCalled();
		expect(session.user).toBeNull();
		expect(session.isLoaded).toBe(true);
	});

	it('clears tokens and stays memoised after a 401', async () => {
		const { ensureSession, session, ApiError } = await freshModule();
		getMe.mockRejectedValue(new ApiError('nope', 401));

		await ensureSession();
		await ensureSession();

		expect(clearTokens).toHaveBeenCalledOnce();
		expect(session.user).toBeNull();
		expect(getMe).toHaveBeenCalledTimes(1);
	});

	// A transient failure must not be cached as "signed out": doing so strands the user on
	// a sign-in prompt for the rest of the session while their token is still valid.
	it('retries after a network failure instead of caching it', async () => {
		const { ensureSession, session, ApiError } = await freshModule();
		getMe.mockRejectedValueOnce(new ApiError('Network error', 0));

		await expect(ensureSession()).rejects.toMatchObject({ status: 0 });
		expect(clearTokens).not.toHaveBeenCalled();

		await ensureSession();

		expect(getMe).toHaveBeenCalledTimes(2);
		expect(session.user).toEqual(alice);
	});
});

describe('endSession', () => {
	it('drops the memo so a later sign-in refetches', async () => {
		const { ensureSession, endSession, session } = await freshModule();

		await ensureSession();
		endSession();
		expect(session.user).toBeNull();

		await ensureSession();

		expect(getMe).toHaveBeenCalledTimes(2);
		expect(session.user).toEqual(alice);
	});
});

describe('loadSession', () => {
	it('refetches even when a session is already loaded', async () => {
		const { ensureSession, loadSession } = await freshModule();

		await ensureSession();
		await loadSession();

		expect(getMe).toHaveBeenCalledTimes(2);
	});
});
