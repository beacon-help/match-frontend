import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import ProfileCard from './ProfileCard.svelte';
import type { UserSchema } from '$lib/api/user';

vi.mock('virtual:match-config', () => ({
	default: {
		volunteer_properties: [
			{ value: 'has_car', label: 'I have a car' },
			{ value: 'has_tools', label: 'I have tools' }
		]
	}
}));

const volunteer: UserSchema = {
	id: 1,
	first_name: 'Marta',
	last_name: 'Kowalczyk',
	email: 'marta.k@example.com',
	is_verified: true,
	user_type: 'volunteer',
	properties: ['has_car', 'has_tools']
};

describe('ProfileCard', () => {
	it('shows a volunteer their role and how they can help', () => {
		render(ProfileCard, { props: { user: volunteer } });

		expect(screen.getByText('Volunteer')).toBeInTheDocument();
		expect(screen.getByText('How can you help?')).toBeInTheDocument();
		expect(screen.getByText('I have a car')).toBeInTheDocument();
		expect(screen.getByText('I have tools')).toBeInTheDocument();
	});

	it('tells a volunteer with no properties that nothing is selected', () => {
		render(ProfileCard, { props: { user: { ...volunteer, properties: [] } } });

		expect(screen.getByText('Nothing selected yet.')).toBeInTheDocument();
	});

	it('shows a help-seeker their role and no properties section', () => {
		render(ProfileCard, {
			props: { user: { ...volunteer, user_type: 'help-seeker', properties: [] } }
		});

		expect(screen.getByText('Help-seeker')).toBeInTheDocument();
		expect(screen.queryByText('How can you help?')).not.toBeInTheDocument();
	});
});
