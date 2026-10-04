import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import VolunteerSignupForm from './VolunteerSignupForm.svelte';
import type { VolunteerSignup } from '$lib/types/signup';

vi.mock('virtual:match-config', () => ({
	default: {
		volunteer_properties: [
			{ value: 'has_boat', label: 'I have a boat' },
			{ value: 'speaks_valencian', label: 'I speak Valencian' }
		]
	}
}));

function emptySignup(): VolunteerSignup {
	const signup: VolunteerSignup = $state({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		properties: []
	});
	return signup;
}

describe('VolunteerSignupForm', () => {
	it('offers the volunteer properties from the config', () => {
		render(VolunteerSignupForm, { props: { signup: emptySignup(), onSubmit: vi.fn() } });

		expect(screen.getByLabelText('I have a boat')).toBeInTheDocument();
		expect(screen.getByLabelText('I speak Valencian')).toBeInTheDocument();
	});

	it('records the value of a ticked property', async () => {
		const signup = emptySignup();
		render(VolunteerSignupForm, { props: { signup, onSubmit: vi.fn() } });

		await fireEvent.click(screen.getByLabelText('I speak Valencian'));

		expect(signup.properties).toEqual(['speaks_valencian']);
	});
});
