import { describe, it, expect } from 'vitest';
import {
	countProfileChanges,
	describeUnsavedChanges,
	profileFormFrom,
	toProfileUpdate
} from './edit';
import type { UserSchema } from '$lib/api/user';
import type { ProfileForm } from '$lib/types/profile';

const saved: ProfileForm = {
	firstName: 'Marta',
	lastName: 'Kowalczyk',
	properties: ['has_car', 'has_tools']
};

describe('profileFormFrom', () => {
	it('copies the editable fields of the user', () => {
		const user: UserSchema = {
			id: 1,
			first_name: 'Marta',
			last_name: 'Kowalczyk',
			email: 'marta@example.com',
			is_verified: true,
			user_type: 'volunteer',
			properties: ['has_car']
		};

		const form = profileFormFrom(user);

		expect(form).toEqual({ firstName: 'Marta', lastName: 'Kowalczyk', properties: ['has_car'] });
		expect(form.properties).not.toBe(user.properties);
	});
});

describe('toProfileUpdate', () => {
	it('trims the names and sends the properties of a volunteer', () => {
		expect(toProfileUpdate({ ...saved, firstName: ' Marta ' }, 'volunteer')).toEqual({
			firstName: 'Marta',
			lastName: 'Kowalczyk',
			properties: ['has_car', 'has_tools']
		});
	});

	it('sends an empty properties list for a volunteer', () => {
		expect(toProfileUpdate({ ...saved, properties: [] }, 'volunteer')).toHaveProperty(
			'properties',
			[]
		);
	});

	it('leaves properties out for a help-seeker', () => {
		expect(toProfileUpdate({ ...saved, properties: [] }, 'help-seeker')).toEqual({
			firstName: 'Marta',
			lastName: 'Kowalczyk'
		});
	});
});

describe('countProfileChanges', () => {
	it('is zero when nothing changed', () => {
		expect(countProfileChanges(saved, { ...saved, properties: ['has_tools', 'has_car'] })).toBe(0);
	});

	it('counts each changed name', () => {
		expect(countProfileChanges(saved, { ...saved, firstName: 'Marta ' })).toBe(1);
		expect(countProfileChanges(saved, { ...saved, firstName: 'M', lastName: 'K' })).toBe(2);
	});

	it('counts each ticked and unticked box', () => {
		expect(countProfileChanges(saved, { ...saved, properties: ['has_car', 'can_host'] })).toBe(2);
	});

	it('adds name and tick box changes together', () => {
		expect(countProfileChanges(saved, { ...saved, lastName: 'K', properties: [] })).toBe(3);
	});
});

describe('describeUnsavedChanges', () => {
	it.each([
		[0, 'No changes'],
		[1, '1 unsaved change'],
		[3, '3 unsaved changes']
	])('describes %i changes', (count, text) => {
		expect(describeUnsavedChanges(count)).toBe(text);
	});
});
