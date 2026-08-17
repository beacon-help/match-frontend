import type { VolunteerProperties } from '$lib/api/user';

export type Signup = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};

export type VolunteerSignup = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	properties: VolunteerProperties[];
};
