<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';
	import { createMap, type MapHandle } from '$lib/map/createMap';

	interface MapMarker {
		lat: number;
		lon: number;
		label?: string;
	}

	interface Props {
		markers: MapMarker[];
		center?: [number, number];
		zoom?: number;
	}

	let { markers, center = [39.47, -0.38], zoom = 9 }: Props = $props();

	let container: HTMLDivElement;
	// One atomic handle rather than four variables: the marker $effect reads it first, so a
	// partially-assigned map can never leave `markers` out of the effect's dependencies.
	// $state.raw because Leaflet objects must not be proxied.
	let handle = $state.raw<(MapHandle & { markerLayer: Leaflet.FeatureGroup }) | undefined>();

	onMount(() => {
		const aborter = new AbortController();

		createMap(container, { center, zoom, signal: aborter.signal })
			.then((created) => {
				if (!created) return;
				if (aborter.signal.aborted) {
					created.map.remove();
					return;
				}
				handle = { ...created, markerLayer: created.L.featureGroup().addTo(created.map) };
			})
			.catch((err) => {
				// Swallow load/init failures (e.g. a non-DOM test environment) so they don't
				// surface as unhandled rejections.
				console.error('Failed to initialise map', err);
			});

		return () => {
			aborter.abort();
			handle?.map.remove();
			handle = undefined;
		};
	});

	$effect(() => {
		const active = handle;
		if (!active) return;

		active.markerLayer.clearLayers();
		for (const marker of markers) {
			const pin = active.L.marker([marker.lat, marker.lon], { icon: active.icon });
			if (marker.label) pin.bindPopup(marker.label);
			pin.addTo(active.markerLayer);
		}

		if (markers.length > 0) {
			active.map.fitBounds(active.markerLayer.getBounds(), { padding: [40, 40], maxZoom: 13 });
		}
	});
</script>

<div
	bind:this={container}
	role="application"
	aria-label="Map of task locations"
	class="isolate aspect-[5/3] w-full overflow-hidden rounded-2xl border border-gray-200"
></div>
