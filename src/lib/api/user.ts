import { apiFetch } from '$lib/api/client';
import type { Signup } from '$lib/types/signup';
import type { VolunteerSignup } from '$lib/types/signup';
import type { Login } from '$lib/types/login';

// Wire value is hyphenated (`help-seeker`), unlike the `/signup/helpseeker` path segment.
export type UserType = 'help-seeker' | 'volunteer';

// Volunteer capabilities, matching the backend `VolunteerProperties` enum.
export type VolunteerProperties = 'HAS_CAR' | 'CAN_HOST' | 'CAN_WORK_PHYSICAL' | 'HAS_TOOLS';

export type HelpseekerCreationRequestSchema = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
};

export type VolunteerCreationRequestSchema = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	properties: VolunteerProperties[];
};

export type UserSchema = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	is_verified: boolean;
	user_type: UserType;
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

export function signupVolunteer(signup: VolunteerSignup): Promise<UserSchema> {
	const body: VolunteerCreationRequestSchema = {
		first_name: signup.firstName,
		last_name: signup.lastName,
		email: signup.email,
		password: signup.password,
		properties: signup.properties
	};

	return apiFetch<UserSchema>('/user/signup/volunteer', {
		method: 'POST',
		body
	});
}

export function getUser(id: number, accessToken: string): Promise<UserSchema> {
	return apiFetch<UserSchema>(`/user/${id}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export type TokenSchema = {
	access_token: string;
	refresh_token: string;
	token_type?: string;
};

export function getMe(accessToken: string): Promise<UserSchema> {
	return apiFetch<UserSchema>('/user/me', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
}

export function loginUser(login: Login): Promise<TokenSchema> {
	const body = new URLSearchParams({
		grant_type: 'password',
		username: login.email,
		password: login.password
	});

	return apiFetch<TokenSchema>('/user/login', {
		method: 'POST',
		body
	});
}
