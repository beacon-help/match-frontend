import type { UserSchema, UserType } from '$lib/api/user';
import type { ProfileForm, ProfileUpdate } from '$lib/types/profile';

export function profileFormFrom(user: UserSchema): ProfileForm {
	return {
		firstName: user.first_name,
		lastName: user.last_name,
		properties: [...user.properties]
	};
}

export function toProfileUpdate(form: ProfileForm, role: UserType): ProfileUpdate {
	const update: ProfileUpdate = {
		firstName: form.firstName.trim(),
		lastName: form.lastName.trim()
	};
	if (role === 'volunteer') {
		update.properties = [...form.properties];
	}
	return update;
}

/** Each changed name counts once, and so does each toggled tick box. */
export function countProfileChanges(saved: ProfileForm, current: ProfileForm): number {
	const ticked = current.properties.filter((p) => !saved.properties.includes(p)).length;
	const unticked = saved.properties.filter((p) => !current.properties.includes(p)).length;

	return (
		Number(current.firstName !== saved.firstName) +
		Number(current.lastName !== saved.lastName) +
		ticked +
		unticked
	);
}

export function describeUnsavedChanges(count: number): string {
	if (count === 0) {
		return 'No changes';
	}
	return count === 1 ? '1 unsaved change' : `${count} unsaved changes`;
}
