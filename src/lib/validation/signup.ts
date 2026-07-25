import type { Signup } from '$lib/types/signup';

export type SignupErrors = Partial<Record<keyof Signup, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(signup: Signup): SignupErrors {
	const errors: SignupErrors = {};

	if (!signup.firstName.trim()) {
		errors.firstName = 'First name is required.';
	}

	if (!signup.lastName.trim()) {
		errors.lastName = 'Last name is required.';
	}

	if (!signup.email.trim()) {
		errors.email = 'Email is required.';
	} else if (!EMAIL_PATTERN.test(signup.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!signup.password) {
		errors.password = 'Password is required.';
	} else if (signup.password.length < 8) {
		errors.password = 'Password must be at least 8 characters.';
	}

	return errors;
}
