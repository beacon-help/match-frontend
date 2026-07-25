<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import { getMe, type UserSchema } from '$lib/api/user';
	import { getAccessToken } from '$lib/auth/tokens';
	import { ApiError, describeApiError } from '$lib/api/client';

	let user: UserSchema | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	// True when there is no usable session (no token, or the token was rejected) — the
	// user needs to sign in before we can show a profile.
	let needsSignIn = $state(false);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

		try {
			user = await getMe(token);
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				needsSignIn = true;
			} else {
				error = describeApiError(err);
			}
		} finally {
			isLoading = false;
		}
	});
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Profile</h3>

	{#if isLoading}
		<p class="text-gray-600">Loading your profile…</p>
	{:else if needsSignIn}
		<p class="text-gray-600">
			You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
				>sign in</a
			> to view your profile.
		</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if user}
		<ProfileCard {user} />
	{/if}
</section>
