<script lang="ts">
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import { session } from '$lib/auth/session.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';

	const authed = createAuthedPage();
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Profile</h3>

	{#if authed.isLoading}
		<p class="text-gray-600">Loading your profile…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view your profile" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
	{:else if session.user}
		<ProfileCard user={session.user} />
	{/if}
</section>
