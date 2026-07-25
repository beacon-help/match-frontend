import { apiFetch } from '$lib/api/client';
import type { Signup } from '$lib/types/signup';

export type HelpseekerCreationRequestSchema = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
};

export type UserSchema = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	is_verified: boolean;
};

export function signupHelpseeker(signup: Signup): Promise<UserSchema> {
	const body: HelpseekerCreationRequestSchema = {
		first_name: signup.firstName,
		last_name: signup.lastName,
		email: signup.email,
		password: signup.password
	};

	return apiFetch<UserSchema>('/user/signup/helpseeker', {
		method: 'POST',
		body
	});
}
