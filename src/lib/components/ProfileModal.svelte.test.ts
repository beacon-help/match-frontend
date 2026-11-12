import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import ProfileModal from './ProfileModal.svelte';

const getUser = vi.fn();

vi.mock('$lib/api/user', () => ({
	getUser: (id: number, token: string) => getUser(id, token)
}));
vi.mock('$lib/auth/tokens', () => ({ getAccessToken: () => 'access-token' }));

describe('ProfileModal', () => {
	it("shows another user's public profile", async () => {
		getUser.mockResolvedValue({ id: 7, user_type: 'volunteer', first_name: 'Marta' });

		render(ProfileModal, { props: { userId: 7, onClose: vi.fn() } });

		expect(await screen.findByText('Marta')).toBeInTheDocument();
		expect(screen.getByText('Volunteer')).toBeInTheDocument();
		expect(getUser).toHaveBeenCalledWith(7, 'access-token');
	});
});
