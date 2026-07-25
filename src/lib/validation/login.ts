import type { Login } from '$lib/types/login';

export type LoginErrors = Partial<Record<keyof Login, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(login: Login): LoginErrors {
	const errors: LoginErrors = {};

	if (!login.email.trim()) {
		errors.email = 'Email is required.';
	} else if (!EMAIL_PATTERN.test(login.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!login.password) {
		errors.password = 'Password is required.';
	}

	return errors;
}
