import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import Page from './+page.svelte';
import { session, setSessionUser } from '$lib/auth/session.svelte';
import type { UserSchema } from '$lib/api/user';

vi.mock('virtual:match-config', () => ({
	default: {
		api_base_url: 'http://api.test',
		volunteer_properties: [{ value: 'has_car', label: 'I have a car' }]
	}
}));
vi.mock('$lib/auth/tokens', () => ({
	getAccessToken: () => 'tok',
	clearTokens: vi.fn()
}));
vi.mock('$lib/auth/authedPage.svelte', () => ({
	createAuthedPage: () => ({ isLoading: false, needsSignIn: false, error: null })
}));

const marta: UserSchema = {
	id: 1,
	first_name: 'Marta',
	last_name: 'Kowalczyk',
	email: 'marta@example.com',
	is_verified: true,
	user_type: 'volunteer',
	properties: []
};

beforeEach(() => {
	setSessionUser(marta);
	vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('/me/edit', () => {
	it('shows the profile and password sections', () => {
		render(Page);

		expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Password' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: '← Back to profile' })).toHaveAttribute('href', '/me');
	});

	it('puts the profile and keeps the session user in step', async () => {
		const updated = { ...marta, first_name: 'Martha', properties: ['has_car'] };
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => updated
		} as Response);
		render(Page);

		await fireEvent.input(screen.getByLabelText('First name'), { target: { value: 'Martha' } });
		await fireEvent.click(screen.getByLabelText('I have a car'));
		await fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

		await waitFor(() => expect(session.user).toEqual(updated));
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toBe('http://api.test/user/me');
		expect(init?.method).toBe('PUT');
		expect(JSON.parse(init?.body as string)).toEqual({
			first_name: 'Martha',
			last_name: 'Kowalczyk',
			properties: ['has_car']
		});
	});

	it('puts the password change to /user/me/password', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response);
		render(Page);

		await fireEvent.input(screen.getByLabelText('Current password'), {
			target: { value: 'old-secret' }
		});
		await fireEvent.input(screen.getByLabelText('New password'), {
			target: { value: 'new-secret' }
		});
		await fireEvent.input(screen.getByLabelText('Repeat new password'), {
			target: { value: 'new-secret' }
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

		expect(await screen.findByText('✓ Password updated')).toBeInTheDocument();
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(String(url)).toBe('http://api.test/user/me/password');
		expect(init?.method).toBe('PUT');
	});
});
