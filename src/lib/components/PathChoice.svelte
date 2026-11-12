<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		title: string;
		text: string;
		href: ResolvedPathname;
		cta: string;
	}

	let { title, text, href, cta }: Props = $props();
</script>

<div
	class="border-line py-6 max-sm:not-first:border-t sm:pr-8 sm:not-first:border-l sm:not-first:pl-8"
>
	<h2 class="text-2xl font-bold">{title}</h2>
	<p class="mt-1.5 mb-4 text-ink-soft">{text}</p>
	<Button variant="primary" {href}>{cta}</Button>
</div>
