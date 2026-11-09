import { describe, it, expect } from 'vitest';
import { validatePasswordChange, validateProfile } from './profile';
import type { PasswordForm, ProfileForm } from '$lib/types/profile';

const profile: ProfileForm = {
	firstName: 'Marta',
	lastName: 'Kowalczyk',
	properties: []
};

const change: PasswordForm = {
	currentPassword: 'old-secret',
	newPassword: 'new-secret',
	repeatPassword: 'new-secret'
};

describe('validateProfile', () => {
	it('returns no errors for valid input', () => {
		expect(validateProfile(profile)).toEqual({});
	});

	it('requires a first name', () => {
		expect(validateProfile({ ...profile, firstName: '  ' })).toEqual({
			firstName: 'Enter your first name.'
		});
	});

	it('requires a last name', () => {
		expect(validateProfile({ ...profile, lastName: '' })).toEqual({
			lastName: 'Enter your last name.'
		});
	});
});

describe('validatePasswordChange', () => {
	it('returns no errors for valid input', () => {
		expect(validatePasswordChange(change)).toEqual({});
	});

	it('requires the current password', () => {
		expect(validatePasswordChange({ ...change, currentPassword: '' })).toEqual({
			currentPassword: 'Enter your current password.'
		});
	});

	it('requires a new password of at least 8 characters', () => {
		expect(
			validatePasswordChange({ ...change, newPassword: 'short', repeatPassword: 'short' })
		).toEqual({ newPassword: 'Use at least 8 characters.' });
	});

	it('accepts a new password of exactly 8 characters', () => {
		expect(
			validatePasswordChange({ ...change, newPassword: '12345678', repeatPassword: '12345678' })
		).toEqual({});
	});

	it('requires the new password to differ from the current one', () => {
		expect(
			validatePasswordChange({ ...change, newPassword: 'old-secret', repeatPassword: 'old-secret' })
		).toEqual({ newPassword: 'Pick something different from your current password.' });
	});

	it('requires the repeated password to match the new one', () => {
		expect(validatePasswordChange({ ...change, repeatPassword: 'new-secreT' })).toEqual({
			repeatPassword: "This doesn't match the new password."
		});
	});

	it('reports every error at once', () => {
		expect(
			validatePasswordChange({ currentPassword: '', newPassword: 'short', repeatPassword: '' })
		).toEqual({
			currentPassword: 'Enter your current password.',
			newPassword: 'Use at least 8 characters.',
			repeatPassword: "This doesn't match the new password."
		});
	});
});
