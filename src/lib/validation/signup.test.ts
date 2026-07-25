import { describe, it, expect } from 'vitest';
import { validateSignup } from './signup';
import type { Signup } from '$lib/types/signup';

const valid: Signup = {
	firstName: 'Alex',
	lastName: 'Johnson',
	email: 'alex@example.com',
	password: 'password123'
};

describe('validateSignup', () => {
	it('returns no errors for valid input', () => {
		expect(validateSignup(valid)).toEqual({});
	});

	it('requires first name', () => {
		expect(validateSignup({ ...valid, firstName: '' })).toHaveProperty('firstName');
	});

	it('requires last name', () => {
		expect(validateSignup({ ...valid, lastName: '  ' })).toHaveProperty('lastName');
	});

	it('requires a valid email', () => {
		expect(validateSignup({ ...valid, email: 'not-an-email' })).toHaveProperty('email');
	});

	it('requires a password of at least 8 characters', () => {
		expect(validateSignup({ ...valid, password: 'short' })).toHaveProperty('password');
	});
});
