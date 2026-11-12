<script lang="ts">
	import { onMount } from 'svelte';
	import config from 'virtual:match-config';
	import { listPublicTasks } from '$lib/api/task';
	import { getStats } from '$lib/api/stats';
	import { describeApiError } from '$lib/api/client';
	import { session } from '$lib/auth/session.svelte';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import StatsHero from '$lib/components/StatsHero.svelte';
	import StatsFigures from '$lib/components/StatsFigures.svelte';
	import { statsFigures } from '$lib/stats/headline';
	import type { Stats } from '$lib/types/stats';
	import { ABOUT_MATCH, HOW_IT_WORKS } from '$lib/home/content';
	import { spans } from '$lib/home/richText';

	type MapMarker = { lat: number; lon: number; label?: string };

	let markers = $state<MapMarker[]>([]);
	let mapError = $state('');
	let stats = $state<Stats | null>(null);

	const figures = $derived(statsFigures(stats));

	async function loadStats() {
		try {
			stats = await getStats();
		} catch {
			// The hero falls back to number-free copy; stats are not worth an error message.
		}
	}

	onMount(async () => {
		loadStats();
		try {
			const tasks = await listPublicTasks();
			markers = tasks
				.map((t) => ({
					lat: Number(t.location.lat),
					lon: Number(t.location.lon),
					label: t.title
				}))
				.filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon));
		} catch (err) {
			mapError = describeApiError(err);
		}
	});
</script>

<main>
	<div class="mx-auto w-full max-w-5xl px-4 sm:px-6">
		<StatsHero {stats} role={session.role} />

		<div class="flex flex-col gap-7 sm:gap-10">
			{#if figures.length > 0}
				<div class="max-sm:order-2">
					<StatsFigures {figures} />
				</div>
			{/if}

			<section>
				<h2 class="mb-2 text-xl font-bold sm:mb-3.5 sm:text-2xl">Where help is needed</h2>
				<HomeMap {markers} />
				<p class="mt-2 text-base text-ink-soft">Requests for help across the affected area.</p>
				{#if mapError}
					<p class="mt-2 text-base text-danger">Couldn't load task locations: {mapError}</p>
				{/if}
			</section>
		</div>

		<div class="grid gap-x-16 gap-y-9 pt-9 sm:pt-14 lg:grid-cols-[1.15fr_1fr]">
			<section>
				<h2 class="text-2xl font-bold">What happened</h2>
				<div class="mt-3.5 space-y-4">
					{#each config.what_happened as paragraph (paragraph)}
						<p>
							{#each spans(paragraph) as span, i (i)}
								{#if span.strong}<strong>{span.text}</strong>{:else}{span.text}{/if}
							{/each}
						</p>
					{/each}
				</div>
			</section>

			<section>
				<h2 class="text-2xl font-bold">How it works</h2>
				<ol class="mt-3.5 border-t border-line">
					{#each HOW_IT_WORKS as step, i (step.title)}
						<li class="grid grid-cols-[1.75rem_1fr] border-b border-line py-3">
							<span class="font-semibold text-ink-soft">{i + 1}.</span>
							<div>
								<p class="font-bold">{step.title}</p>
								<p class="text-ink-soft">{step.text}</p>
							</div>
						</li>
					{/each}
				</ol>
			</section>
		</div>
	</div>

	<section class="mt-10 bg-fill pt-7 pb-8 sm:mt-16 sm:pt-9 sm:pb-10">
		<div class="mx-auto w-full max-w-5xl px-4 sm:px-6">
			<h2 class="text-2xl font-bold">About Match</h2>
			<ul class="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-3">
				{#each ABOUT_MATCH as fact (fact.title)}
					<li>
						<p class="font-bold">{fact.title}</p>
						<p class="text-ink-soft">{fact.text}</p>
					</li>
				{/each}
			</ul>
		</div>
	</section>
</main>
