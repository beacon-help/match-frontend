import { describe, it, expect } from 'vitest';
import { validateVolunteerSignup } from './volunteerSignup';
import type { VolunteerSignup } from '$lib/types/signup';

const valid: VolunteerSignup = {
	firstName: 'Sam',
	lastName: 'Rivera',
	email: 'sam@example.com',
	password: 'password123',
	properties: ['HAS_CAR']
};

describe('validateVolunteerSignup', () => {
	it('returns no errors for valid input', () => {
		expect(validateVolunteerSignup(valid)).toEqual({});
	});

	it('accepts an empty capability list', () => {
		expect(validateVolunteerSignup({ ...valid, properties: [] })).toEqual({});
	});

	it('requires a valid email', () => {
		expect(validateVolunteerSignup({ ...valid, email: 'nope' })).toHaveProperty('email');
	});

	it('requires a password of at least 8 characters', () => {
		expect(validateVolunteerSignup({ ...valid, password: 'short' })).toHaveProperty('password');
	});
});
