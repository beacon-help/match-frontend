<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<div class="grid gap-x-4 border-b border-line py-2.5 sm:grid-cols-[11rem_1fr]">
	<dt class="font-semibold">{label}</dt>
	<dd class="min-w-0 break-words">{@render children()}</dd>
</div>
