import { describe, it, expect } from 'vitest';
import { validateLogin } from './login';
import type { Login } from '$lib/types/login';

const valid: Login = {
	email: 'alex@example.com',
	password: 'password123'
};

describe('validateLogin', () => {
	it('returns no errors for valid input', () => {
		expect(validateLogin(valid)).toEqual({});
	});

	it('requires an email', () => {
		expect(validateLogin({ ...valid, email: '  ' })).toHaveProperty('email');
	});

	it('requires a valid email', () => {
		expect(validateLogin({ ...valid, email: 'not-an-email' })).toHaveProperty('email');
	});

	it('requires a password', () => {
		expect(validateLogin({ ...valid, password: '' })).toHaveProperty('password');
	});
});
