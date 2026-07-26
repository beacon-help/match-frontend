<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';

	interface Props {
		/** Free-text address (source of truth — geocoding is mocked). Bindable. */
		address: string;
		/** Marker latitude, set by clicking the map. Bindable. May arrive as a string. */
		lat: number | string;
		/** Marker longitude, set by clicking the map. Bindable. May arrive as a string. */
		lon: number | string;
		error?: string;
	}

	let { address = $bindable(), lat = $bindable(), lon = $bindable(), error }: Props = $props();

	let container: HTMLDivElement;
	// Leaflet touches `window`, so load it client-side only, matching HomeMap.
	let L = $state<typeof Leaflet>();
	let map: Leaflet.Map | undefined;
	let marker: Leaflet.Marker | undefined;
	let icon: Leaflet.Icon | undefined;

	const inputClasses =
		'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	function placeMarker(la: number, lo: number) {
		if (!L || !map) return;
		lat = la;
		lon = lo;
		if (marker) {
			marker.setLatLng([la, lo]);
		} else {
			marker = L.marker([la, lo], icon ? { icon } : undefined).addTo(map);
		}
	}

	onMount(() => {
		let disposed = false;

		import('leaflet')
			.then((mod) => {
				if (disposed) return;
				const lib = mod.default;

				// Default to Valencia; if a location was prefilled (Edit), center on it.
				const start: [number, number] = [Number(lat) || 39.47, Number(lon) || -0.38];
				map = lib.map(container).setView(start, Number(lat) ? 14 : 12);
				lib
					.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
						maxZoom: 19
					})
					.addTo(map);

				icon = lib.icon({
					iconUrl: '/home/marker.svg',
					iconSize: [16, 20],
					iconAnchor: [8, 20],
					popupAnchor: [0, -18]
				});

				L = lib;
				if (Number(lat) && Number(lon)) {
					placeMarker(Number(lat), Number(lon));
				}

				// Clicking the map drops/moves the pin, giving real coordinates.
				map.on('click', (e: Leaflet.LeafletMouseEvent) => {
					placeMarker(e.latlng.lat, e.latlng.lng);
				});
			})
			.catch((err) => {
				console.error('Failed to initialise map', err);
			});

		return () => {
			disposed = true;
			map?.remove();
			map = undefined;
		};
	});
</script>

<div class="flex flex-col gap-2">
	<label class="text-sm font-medium text-gray-700" for="address-input">Address</label>
	<!-- Mock geocode: the address is stored as typed; click the map to set coordinates. -->
	<input
		id="address-input"
		type="text"
		bind:value={address}
		placeholder="e.g. Carrer de Colón 12, Valencia"
		class={inputClasses}
	/>
	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}
	<div
		bind:this={container}
		role="application"
		aria-label="Click the map to set the task location"
		class="aspect-[5/3] w-full overflow-hidden rounded-2xl border border-gray-200"
	></div>
	<p class="text-xs text-gray-500">Click on the map to drop a pin for the location.</p>
</div>
