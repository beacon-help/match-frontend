import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import Harness from './AuthedPageHarness.svelte';
import { ApiError } from '$lib/api/client';

const getAccessToken = vi.fn();
const ensureSession = vi.fn();
const sessionUser = { current: null as { id: number } | null };

vi.mock('$lib/auth/tokens', () => ({ getAccessToken: () => getAccessToken() }));
vi.mock('$lib/auth/session.svelte', () => ({
	ensureSession: () => ensureSession(),
	session: {
		get user() {
			return sessionUser.current;
		}
	}
}));

function state() {
	return screen.getByTestId('state').textContent?.trim();
}

beforeEach(() => {
	vi.clearAllMocks();
	getAccessToken.mockReturnValue('tok');
	ensureSession.mockResolvedValue(undefined);
	sessionUser.current = { id: 7 };
});

describe('createAuthedPage', () => {
	it('exposes the loader result once resolved', async () => {
		render(Harness, { load: async () => 'payload' });

		await waitFor(() => expect(state()).toBe('data:payload'));
	});

	it('asks for sign-in when there is no token', async () => {
		getAccessToken.mockReturnValue(null);
		render(Harness);

		await waitFor(() => expect(state()).toBe('needs-sign-in'));
		expect(ensureSession).not.toHaveBeenCalled();
	});

	it('asks for sign-in when the session resolves to no user', async () => {
		sessionUser.current = null;
		render(Harness, { load: async () => 'payload' });

		await waitFor(() => expect(state()).toBe('needs-sign-in'));
	});

	it('asks for sign-in when the loader 401s', async () => {
		render(Harness, {
			load: async () => {
				throw new ApiError('nope', 401);
			}
		});

		await waitFor(() => expect(state()).toBe('needs-sign-in'));
	});

	// A network failure is not a signed-out user, so it must surface as an error.
	it('reports a network failure as an error', async () => {
		render(Harness, {
			load: async () => {
				throw new ApiError('Network error', 0);
			}
		});

		await waitFor(() =>
			expect(state()).toBe('error:Unable to reach the server, check your connection.')
		);
	});

	it('runs the loader alongside the session rather than after it', async () => {
		let sessionDone = false;
		let loadStartedBeforeSessionFinished = false;

		let releaseSession: () => void = () => {};
		ensureSession.mockImplementation(
			() =>
				new Promise<void>((res) => {
					releaseSession = () => {
						sessionDone = true;
						res();
					};
				})
		);

		render(Harness, {
			load: async () => {
				loadStartedBeforeSessionFinished = !sessionDone;
				return 'payload';
			}
		});

		await waitFor(() => expect(loadStartedBeforeSessionFinished).toBe(true));
		releaseSession();
		await waitFor(() => expect(state()).toBe('data:payload'));
	});
});
