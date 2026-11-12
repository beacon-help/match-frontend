<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		href: ResolvedPathname;
		current?: boolean;
		children: Snippet;
	}

	let { href, current = false, children }: Props = $props();
</script>

<a
	{href}
	aria-current={current ? 'page' : undefined}
	class={[
		'flex items-center border-b-[3px] px-2 text-base font-semibold whitespace-nowrap text-ink hover:underline sm:px-3.5',
		current ? 'border-navy' : 'border-transparent'
	]}
>
	{@render children()}
</a>
