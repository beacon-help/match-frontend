import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMe, loginUser } from './user';

function mockFetchResponse(status: number, body: unknown) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	} as Response;
}

describe('getMe', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('requests /user/me with a Bearer authorization header', async () => {
		const me = {
			id: 1,
			first_name: 'Alex',
			last_name: 'Johnson',
			email: 'a@b.com',
			is_verified: true
		};
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, me));

		const result = await getMe('tok123');

		expect(result).toEqual(me);
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toMatch(/\/user\/me$/);
		expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok123');
	});
});

describe('loginUser', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('posts the OAuth2 password form to /user/login', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(200, { access_token: 'a', refresh_token: 'r' })
		);

		await loginUser({ email: 'a@b.com', password: 'secret123' });

		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toMatch(/\/user\/login$/);
		expect(init?.method).toBe('POST');
		expect(init?.body).toBeInstanceOf(URLSearchParams);
		const body = init?.body as URLSearchParams;
		expect(body.get('grant_type')).toBe('password');
		expect(body.get('username')).toBe('a@b.com');
		expect(body.get('password')).toBe('secret123');
	});
});
