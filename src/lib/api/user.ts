import { apiFetch } from '$lib/api/client';
import type { Signup } from '$lib/types/signup';
import type { Login } from '$lib/types/login';

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
