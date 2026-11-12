<script lang="ts">
	import { resolve } from '$app/paths';
	import EditProfileForm from '$lib/components/EditProfileForm.svelte';
	import ChangePasswordForm from '$lib/components/ChangePasswordForm.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
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

<Page>
	<a
		href={resolve('/me')}
		class="mb-1 inline-flex min-h-11 items-center text-base text-navy underline hover:text-navy-dark"
	>
		← Back to profile
	</a>
	<PageHeader title="Edit profile" />

	{#if authed.isLoading}
		<p class="text-ink-soft">Loading your profile…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to edit your profile" />
	{:else if authed.error}
		<p class="text-danger">{authed.error}</p>
	{:else if session.user}
		<div class="max-w-xl space-y-12">
			<EditProfileForm user={session.user} onSave={saveProfile} />
			<ChangePasswordForm onSubmit={savePassword} />
		</div>
	{/if}
</Page>
