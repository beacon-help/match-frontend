import type { VolunteerSignup } from '$lib/types/signup';
import { validateSignup } from './signup';

export type VolunteerSignupErrors = Partial<Record<keyof VolunteerSignup, string>>;

// A volunteer signup shares the help-seeker's identity fields (name/email/password), so we
// reuse `validateSignup` for those. `properties` is optional — an empty capability list is
// allowed by the backend.
export function validateVolunteerSignup(signup: VolunteerSignup): VolunteerSignupErrors {
	return validateSignup(signup);
}
