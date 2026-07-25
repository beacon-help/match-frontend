<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';

	interface MapMarker {
		lat: number;
		lon: number;
		label?: string;
	}

	interface Props {
		markers: MapMarker[];
		/** Fallback center (Valencia) used until markers are available to fit. TODO set from config */
		center?: [number, number];
		zoom?: number;
	}

	let { markers, center = [39.47, -0.38], zoom = 9 }: Props = $props();

	let container: HTMLDivElement;
	// Leaflet touches `window`, so it is loaded client-side only (dynamic import in
	// onMount). `L` becomes reactive state so the marker $effect runs once it's ready.
	let L = $state<typeof Leaflet>();
	let map: Leaflet.Map | undefined;
	let markerLayer: Leaflet.FeatureGroup | undefined;
	let icon: Leaflet.Icon | undefined;

	onMount(() => {
		let disposed = false;

		import('leaflet')
			.then((mod) => {
				if (disposed) return;
				const lib = mod.default;

				map = lib.map(container).setView(center, zoom);
				lib
					.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
						maxZoom: 19
					})
					.addTo(map);

				// Reuse the wireframe's pin asset; anchor its tip (bottom-centre) on the point.
				icon = lib.icon({
					iconUrl: '/home/marker.svg',
					iconSize: [16, 20],
					iconAnchor: [8, 20],
					popupAnchor: [0, -18]
				});
				markerLayer = lib.featureGroup().addTo(map);

				L = lib; // assigning reactive state triggers the marker $effect
			})
			.catch((err) => {
				// Swallow load/init failures (e.g. the component unmounted mid-import, or a
				// non-DOM test environment) so they don't surface as unhandled rejections.
				console.error('Failed to initialise map', err);
			});

		return () => {
			disposed = true;
			map?.remove();
			map = undefined;
		};
	});

	// Sync markers into the map whenever they change (they arrive asynchronously once
	// the task fetch resolves).
	$effect(() => {
		if (!L || !map || !markerLayer || !icon) return;

		markerLayer.clearLayers();
		for (const m of markers) {
			const marker = L.marker([m.lat, m.lon], { icon });
			if (m.label) marker.bindPopup(m.label);
			marker.addTo(markerLayer);
		}

		if (markers.length > 0) {
			map.fitBounds(markerLayer.getBounds(), { padding: [40, 40], maxZoom: 13 });
		}
	});
</script>

<div
	bind:this={container}
	role="application"
	aria-label="Map of task locations "
	class="aspect-[5/3] w-full overflow-hidden rounded-2xl border border-gray-200"
></div>
