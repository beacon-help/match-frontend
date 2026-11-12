<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<main class="mx-auto w-full max-w-5xl px-4 pt-6 pb-14 sm:px-6 sm:pt-10 sm:pb-24">
	{@render children()}
</main>
