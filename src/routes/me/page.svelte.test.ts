import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';
import { setSessionUser } from '$lib/auth/session.svelte';

vi.mock('$lib/auth/authedPage.svelte', () => ({
	createAuthedPage: () => ({ isLoading: false, needsSignIn: false, error: null })
}));

describe('/me', () => {
	it('links to the edit profile page', () => {
		setSessionUser({
			id: 1,
			first_name: 'Marta',
			last_name: 'Kowalczyk',
			email: 'marta@example.com',
			is_verified: true,
			user_type: 'volunteer',
			properties: []
		});
		render(Page);

		expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute('href', '/me/edit');
	});
});
