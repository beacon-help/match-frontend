<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		lede?: string;
		badge?: Snippet;
		action?: Snippet;
	}

	let { title, lede, badge, action }: Props = $props();
</script>

<div class="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 sm:mb-7">
	<div>
		<div class="flex flex-wrap items-center gap-x-4 gap-y-2">
			<h1 class="text-3xl leading-tight font-bold tracking-tight sm:text-4xl sm:leading-tight">
				{title}
			</h1>
			{@render badge?.()}
		</div>
		{#if lede}
			<p class="mt-1.5 text-ink-soft">{lede}</p>
		{/if}
	</div>
	{@render action?.()}
</div>
