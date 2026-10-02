<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onServerUnreachable } from '$lib/api/client';
	import { shouldShowUnavailable } from '$lib/api/availability';
	import Header from '$lib/components/Header.svelte';
	import { ensureSession } from '$lib/auth/session.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	async function showUnavailableIfServerDown() {
		if (!(await shouldShowUnavailable(page.url.pathname))) return;
		const from = encodeURIComponent(page.url.pathname + page.url.search);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolved path plus a query string
		await goto(`${resolve('/unavailable')}?from=${from}`);
	}

	onMount(() => {
		onServerUnreachable(showUnavailableIfServerDown);
		// A transient failure clears the memo, so the next page retries and surfaces it.
		ensureSession().catch(() => {});
		return () => onServerUnreachable(null);
	});
</script>

<Header />
{@render children()}
