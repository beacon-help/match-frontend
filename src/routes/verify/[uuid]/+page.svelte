<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { verifyUser } from '$lib/api/user';
	import { describeApiError } from '$lib/api/client';

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

<section
	class="mx-auto flex min-h-[calc(100vh-106px)] max-w-md flex-col items-center justify-center px-4 text-center"
>
	{#if isLoading}
		<p class="text-gray-600">Verifying your account…</p>
	{:else if error}
		<h3 class="mb-2 text-2xl font-bold text-gray-900">Verification failed</h3>
		<p class="text-red-600">{error}</p>
	{:else}
		<h3 class="mb-2 text-2xl font-bold text-gray-900">Account verified</h3>
		<p class="text-gray-600">
			Your account has been verified. You can now <a
				href={resolve('/login')}
				class="font-medium text-blue-600 hover:text-blue-700">sign in</a
			>.
		</p>
	{/if}
</section>
