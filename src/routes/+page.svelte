<script lang="ts">
	// Home landing page — implements the Figma "Home" frame.
	// See docs/home-implementation-plan.md. The affected-areas section is added in a
	// later step; this covers the centered column, hero copy, and the map.
	import { onMount } from 'svelte';
	import { listPublicTasks } from '$lib/api/task';
	import { describeApiError } from '$lib/api/client';
	import HomeMap from '$lib/components/HomeMap.svelte';

	type MapMarker = { lat: number; lon: number; label?: string };

	let markers = $state<MapMarker[]>([]);
	let mapError = $state('');

	onMount(async () => {
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

<main class="mx-auto max-w-[1000px] space-y-10 px-6 py-12">
	<section class="text-2xl leading-[44px] text-gray-800">
		<p>
			On November 4, 2025, the city of Valencia experienced a severe weather event that brought
			torrential rain, flash floods, and widespread damage across urban and rural areas. The storm
			disrupted transportation, flooded homes, and affected essential infrastructure.
		</p>
		<p>
			This phenomenon, known as a DANA (Isolated Depression in High Levels), has left many residents
			in need of urgent assistance. Volunteers are requested to support cleanup efforts, deliver
			essential supplies, and assist affected families in coordination with local authorities and
			emergency services.
		</p>
	</section>

	<HomeMap {markers} />

	{#if mapError}
		<p class="text-sm text-red-600">Couldn't load task locations: {mapError}</p>
	{/if}
</main>
