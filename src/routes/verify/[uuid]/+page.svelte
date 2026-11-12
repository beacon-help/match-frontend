<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { verifyUser } from '$lib/api/user';
	import { describeApiError } from '$lib/api/client';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const uuid = page.params.uuid ?? '';

	let isLoading = $state(true);
	let error: string | null = $state(null);

	onMount(async () => {
		try {
			await verifyUser(uuid);
		} catch (err) {
			error = describeApiError(err);
		} finally {
			isLoading = false;
		}
	});
</script>

<Page>
	{#if isLoading}
		<p class="text-ink-soft">Verifying your account…</p>
	{:else if error}
		<PageHeader title="Verification failed" />
		<p class="text-danger">{error}</p>
	{:else}
		<PageHeader title="Account verified" />
		<p>
			Your account has been verified. You can now <a
				href={resolve('/login')}
				class="text-navy underline hover:text-navy-dark">sign in</a
			>.
		</p>
	{/if}
</Page>
