<script lang="ts">
	import { onMount } from 'svelte';
	import { getUser, type PublicUserSchema } from '$lib/api/user';
	import { getAccessToken } from '$lib/auth/tokens';
	import { describeApiError } from '$lib/api/client';
	import Modal from '$lib/components/Modal.svelte';
	import PublicProfileCard from '$lib/components/PublicProfileCard.svelte';

	interface Props {
		userId: number;
		onClose: () => void;
	}

	let { userId, onClose }: Props = $props();

	let user: PublicUserSchema | null = $state(null);
	let isLoading = $state(true);
	let error: string | null = $state(null);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			error = 'You need to sign in to view this profile.';
			isLoading = false;
			return;
		}

		try {
			user = await getUser(userId, token);
		} catch (err) {
			error = describeApiError(err);
		} finally {
			isLoading = false;
		}
	});
</script>

<Modal title="Profile" {onClose}>
	{#if isLoading}
		<p class="text-ink-soft">Loading profile…</p>
	{:else if error}
		<p class="text-danger">{error}</p>
	{:else if user}
		<PublicProfileCard {user} />
	{/if}
</Modal>
