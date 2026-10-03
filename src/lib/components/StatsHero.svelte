<script lang="ts">
	import { resolve } from '$app/paths';
	import type { UserType } from '$lib/api/user';
	import type { Stats } from '$lib/types/stats';
	import { liveLabel, statsHeadline, statsSubline } from '$lib/stats/headline';

	interface Props {
		stats: Stats | null;
		role: UserType | null;
	}

	let { stats, role }: Props = $props();

	const headline = $derived(statsHeadline(stats));
	const subline = $derived(statsSubline(stats));
	const live = $derived(liveLabel(stats));
</script>

<section
	aria-labelledby="stats-hero-title"
	class="space-y-7 rounded-3xl bg-gray-900 px-6 py-10 text-white sm:px-10 sm:py-14"
>
	{#if live}
		<p class="flex items-center gap-2.5 text-sm font-medium text-gray-300">
			<span class="relative flex h-2.5 w-2.5" aria-hidden="true">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none"
				></span>
				<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400"></span>
			</span>
			{live}
		</p>
	{/if}

	<h1
		id="stats-hero-title"
		class="max-w-[24ch] text-3xl leading-tight font-semibold tracking-tight sm:text-5xl sm:leading-[1.1]"
	>
		{#each headline as part, i (i)}
			{#if part.highlight}<span class="text-blue-300">{part.text}</span>{:else}{part.text}{/if}
		{/each}
	</h1>

	<p class="max-w-[50ch] text-lg text-gray-300">{subline}</p>

	<div class="flex flex-wrap gap-3">
		{#if role === 'volunteer'}
			<a
				href={resolve('/tasks/search')}
				class="rounded-lg bg-white px-5 py-3 font-medium text-gray-900 hover:bg-gray-100"
			>
				Find a task
			</a>
		{:else if role === 'help-seeker'}
			<a
				href={resolve('/tasks/create')}
				class="rounded-lg bg-white px-5 py-3 font-medium text-gray-900 hover:bg-gray-100"
			>
				Create a task
			</a>
		{:else}
			<a
				href={resolve('/signup/volunteer')}
				class="rounded-lg bg-white px-5 py-3 font-medium text-gray-900 hover:bg-gray-100"
			>
				I want to help
			</a>
			<a
				href={resolve('/signup/helpseeker')}
				class="rounded-lg border border-white/30 px-5 py-3 font-medium text-white hover:bg-white/10"
			>
				I need help
			</a>
		{/if}
	</div>
</section>
