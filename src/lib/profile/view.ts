import config from 'virtual:match-config';
import type { UserType } from '$lib/api/user';

const ROLE_LABELS: Record<UserType, string> = {
	'help-seeker': 'Help-seeker',
	volunteer: 'Volunteer'
};

export function roleLabel(userType: UserType): string {
	return ROLE_LABELS[userType];
}

// A value no longer in the config still shows, just without a nicer label.
export function propertyLabels(properties: string[]): string[] {
	return properties.map(
		(value) => config.volunteer_properties.find((option) => option.value === value)?.label ?? value
	);
}
