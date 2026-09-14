<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { ensureSession } from '$lib/auth/session.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// A transient failure clears the memo, so the next page retries and surfaces it.
		ensureSession().catch(() => {});
	});
</script>

<Header />
{@render children()}
