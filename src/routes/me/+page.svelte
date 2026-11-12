<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { session } from '$lib/auth/session.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';

	const authed = createAuthedPage();
</script>

<Page>
	<PageHeader title="Profile">
		{#snippet action()}
			{#if session.user}
				<Button variant="neutral" href={resolve('/me/edit')}>Edit profile</Button>
			{/if}
		{/snippet}
	</PageHeader>

	{#if authed.isLoading}
		<p class="text-ink-soft">Loading your profile…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view your profile" />
	{:else if authed.error}
		<p class="text-danger">{authed.error}</p>
	{:else if session.user}
		<ProfileCard user={session.user} />
	{/if}
</Page>
