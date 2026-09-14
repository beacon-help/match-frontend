<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';
	import { createMap, type MapHandle } from '$lib/map/createMap';

	interface Props {
		/** Free-text address (source of truth). Bindable. */
		address: string;
		/** Marker latitude, set by clicking the map. Bindable. NaN until a pin is dropped. */
		lat: number;
		/** Marker longitude, set by clicking the map. Bindable. NaN until a pin is dropped. */
		lon: number;
		error?: string;
	}

	let { address = $bindable(), lat = $bindable(), lon = $bindable(), error }: Props = $props();

	let container: HTMLDivElement;
	// Plain let, not $state: nothing reactive reads the handle — placeMarker and the click
	// handler are imperative.
	let handle: MapHandle | undefined;
	let marker: Leaflet.Marker | undefined;

	const inputClasses =
		'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	function placeMarker(la: number, lo: number) {
		if (!handle) return;
		lat = la;
		lon = lo;
		if (marker) {
			marker.setLatLng([la, lo]);
		} else {
			marker = handle.L.marker([la, lo], { icon: handle.icon }).addTo(handle.map);
		}
	}

	onMount(() => {
		const aborter = new AbortController();

		// Finiteness, not truthiness: a legitimate coordinate of 0 must survive. Longitude 0
		// is reachable here — the Greenwich meridian crosses Spain near Valencia.
		const hasLat = Number.isFinite(lat);
		const hasLon = Number.isFinite(lon);
		const center: [number, number] = [hasLat ? lat : 39.47, hasLon ? lon : -0.38];

		createMap(container, { center, zoom: hasLat ? 14 : 12, signal: aborter.signal })
			.then((created) => {
				if (!created) return;
				if (aborter.signal.aborted) {
					created.map.remove();
					return;
				}
				handle = created;

				if (hasLat && hasLon) {
					placeMarker(lat, lon);
				}

				created.map.on('click', (e: Leaflet.LeafletMouseEvent) => {
					placeMarker(e.latlng.lat, e.latlng.lng);
				});
			})
			.catch((err) => {
				console.error('Failed to initialise map', err);
			});

		return () => {
			aborter.abort();
			handle?.map.remove();
			handle = undefined;
			marker = undefined;
		};
	});
</script>

<div class="flex flex-col gap-2">
	<label class="text-sm font-medium text-gray-700" for="address-input">Address</label>
	<!-- TODO: backend — no geocoding endpoint; the address is stored as typed and the
	     coordinates come from clicking the map. -->
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
		class="isolate aspect-[5/3] w-full overflow-hidden rounded-2xl border border-gray-200"
	></div>
	<p class="text-xs text-gray-500">Click on the map to drop a pin for the location.</p>
</div>
