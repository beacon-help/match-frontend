export type ProfileForm = {
	firstName: string;
	lastName: string;
	properties: string[];
};

/** Help-seekers have no properties, so theirs is left out rather than sent empty. */
export type ProfileUpdate = {
	firstName: string;
	lastName: string;
	properties?: string[];
};

export type PasswordUpdate = {
	currentPassword: string;
	newPassword: string;
};

export type PasswordForm = PasswordUpdate & {
	repeatPassword: string;
};
