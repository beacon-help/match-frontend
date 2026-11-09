import type { PasswordForm, ProfileForm } from '$lib/types/profile';

export type ProfileErrors = Partial<Record<'firstName' | 'lastName', string>>;

export type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

const MIN_PASSWORD_LENGTH = 8;

export function validateProfile(profile: ProfileForm): ProfileErrors {
	const errors: ProfileErrors = {};

	if (!profile.firstName.trim()) {
		errors.firstName = 'Enter your first name.';
	}

	if (!profile.lastName.trim()) {
		errors.lastName = 'Enter your last name.';
	}

	return errors;
}

export function validatePasswordChange(change: PasswordForm): PasswordErrors {
	const errors: PasswordErrors = {};

	if (!change.currentPassword) {
		errors.currentPassword = 'Enter your current password.';
	}

	if (change.newPassword.length < MIN_PASSWORD_LENGTH) {
		errors.newPassword = 'Use at least 8 characters.';
	} else if (change.newPassword === change.currentPassword) {
		errors.newPassword = 'Pick something different from your current password.';
	}

	if (change.repeatPassword !== change.newPassword) {
		errors.repeatPassword = "This doesn't match the new password.";
	}

	return errors;
}
