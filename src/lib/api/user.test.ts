import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { changePassword, getMe, loginUser, updateMe } from './user';

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
			is_verified: true,
			user_type: 'volunteer',
			properties: ['has_car']
		};
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, me));

		const result = await getMe('tok123');

		expect(result).toEqual(me);
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toMatch(/\/user\/me$/);
		expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok123');
	});
});

describe('updateMe', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const saved = {
		id: 1,
		first_name: 'Marta',
		last_name: 'Kowalczyk',
		email: 'marta@example.com',
		is_verified: true,
		user_type: 'volunteer',
		properties: ['has_car', 'has_tools']
	};

	it('puts the names and properties to /user/me and returns the saved user', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, saved));

		const result = await updateMe(
			{ firstName: 'Marta', lastName: 'Kowalczyk', properties: ['has_car', 'has_tools'] },
			'tok123'
		);

		expect(result).toEqual(saved);
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toMatch(/\/user\/me$/);
		expect(init?.method).toBe('PUT');
		expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok123');
		expect(JSON.parse(init?.body as string)).toEqual({
			first_name: 'Marta',
			last_name: 'Kowalczyk',
			properties: ['has_car', 'has_tools']
		});
	});

	it('leaves properties out when the update has none', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(200, { ...saved, user_type: 'help-seeker', properties: [] })
		);

		await updateMe({ firstName: 'Marta', lastName: 'Kowalczyk' }, 'tok123');

		const [, init] = vi.mocked(fetch).mock.calls[0];
		expect(JSON.parse(init?.body as string)).toEqual({
			first_name: 'Marta',
			last_name: 'Kowalczyk'
		});
	});

	it('sends an empty properties list when a volunteer unticks everything', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, { ...saved, properties: [] }));

		await updateMe({ firstName: 'Marta', lastName: 'Kowalczyk', properties: [] }, 'tok123');

		const [, init] = vi.mocked(fetch).mock.calls[0];
		expect(JSON.parse(init?.body as string)).toHaveProperty('properties', []);
	});
});

describe('changePassword', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('puts both passwords to /user/me/password', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(204, undefined));

		const result = await changePassword(
			{ currentPassword: 'old-secret', newPassword: 'new-secret' },
			'tok123'
		);

		expect(result).toBeUndefined();
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toMatch(/\/user\/me\/password$/);
		expect(init?.method).toBe('PUT');
		expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok123');
		expect(JSON.parse(init?.body as string)).toEqual({
			current_password: 'old-secret',
			new_password: 'new-secret'
		});
	});

	it('rejects with the server message when the current password is wrong', async () => {
		vi.mocked(fetch).mockResolvedValue(
			mockFetchResponse(400, { detail: 'Current password is incorrect.' })
		);

		await expect(
			changePassword({ currentPassword: 'wrong', newPassword: 'new-secret' }, 'tok123')
		).rejects.toMatchObject({ status: 400, serverMessage: 'Current password is incorrect.' });
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
