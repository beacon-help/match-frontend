<script lang="ts">
	import { resolve } from '$app/paths';
	import EditProfileForm from '$lib/components/EditProfileForm.svelte';
	import ChangePasswordForm from '$lib/components/ChangePasswordForm.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import { changePassword, updateMe, type UserSchema } from '$lib/api/user';
	import { ApiError } from '$lib/api/client';
	import { getAccessToken } from '$lib/auth/tokens';
	import { session, setSessionUser } from '$lib/auth/session.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import type { PasswordUpdate, ProfileUpdate } from '$lib/types/profile';

	const authed = createAuthedPage();

	function accessToken(): string {
		const token = getAccessToken();
		if (!token) {
			throw new ApiError('Not signed in', 401);
		}
		return token;
	}

	async function saveProfile(update: ProfileUpdate): Promise<UserSchema> {
		const user = await updateMe(update, accessToken());
		setSessionUser(user);
		return user;
	}

	function savePassword(update: PasswordUpdate): Promise<void> {
		return changePassword(update, accessToken());
	}
</script>

<section class="container mx-auto px-4 py-10">
	<a href={resolve('/me')} class="text-sm font-medium text-blue-600 hover:text-blue-700">
		← Back to profile
	</a>
	<h3 class="mt-2 mb-6 text-4xl font-bold">Edit profile</h3>

	{#if authed.isLoading}
		<p class="text-gray-600">Loading your profile…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to edit your profile" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
	{:else if session.user}
		<div class="mx-auto max-w-xl space-y-6">
			<EditProfileForm user={session.user} onSave={saveProfile} />
			<ChangePasswordForm onSubmit={savePassword} />
		</div>
	{/if}
</section>
