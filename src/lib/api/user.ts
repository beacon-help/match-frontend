import { apiFetch } from '$lib/api/client';
import type { Signup } from '$lib/types/signup';
import type { VolunteerSignup } from '$lib/types/signup';
import type { Login } from '$lib/types/login';
import type { PasswordUpdate, ProfileUpdate } from '$lib/types/profile';

// Wire value is hyphenated (`help-seeker`), unlike the `/signup/helpseeker` path segment.
export type UserType = 'help-seeker' | 'volunteer';

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
	properties: string[];
};

export type UserSchema = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	is_verified: boolean;
	user_type: UserType;
	properties: string[];
};

export type PublicUserSchema = {
	id: number;
	user_type: UserType;
	first_name: string;
};

export type UserUpdateRequestSchema = {
	first_name: string;
	last_name: string;
	properties?: string[];
};

export type PasswordChangeRequestSchema = {
	current_password: string;
	new_password: string;
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

export function getUser(id: number, accessToken: string): Promise<PublicUserSchema> {
	return apiFetch<PublicUserSchema>(`/user/${id}`, {
		authed: accessToken
	});
}

export type TokenSchema = {
	access_token: string;
	refresh_token: string;
	token_type?: string;
};

export function getMe(accessToken: string): Promise<UserSchema> {
	return apiFetch<UserSchema>('/user/me', {
		authed: accessToken
	});
}

export function updateMe(update: ProfileUpdate, accessToken: string): Promise<UserSchema> {
	const body: UserUpdateRequestSchema = {
		first_name: update.firstName,
		last_name: update.lastName
	};
	if (update.properties) {
		body.properties = update.properties;
	}

	return apiFetch<UserSchema>('/user/me', {
		method: 'PUT',
		body,
		authed: accessToken
	});
}

export function changePassword(update: PasswordUpdate, accessToken: string): Promise<void> {
	const body: PasswordChangeRequestSchema = {
		current_password: update.currentPassword,
		new_password: update.newPassword
	};

	return apiFetch<void>('/user/me/password', {
		method: 'PUT',
		body,
		authed: accessToken
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

export function verifyUser(verificationCode: string): Promise<void> {
	return apiFetch<void>(`/user/verify/${verificationCode}`, {
		method: 'PUT'
	});
}
