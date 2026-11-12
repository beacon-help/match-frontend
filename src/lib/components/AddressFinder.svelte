<script lang="ts">
	import { onMount } from 'svelte';
	import 'leaflet/dist/leaflet.css';
	import type * as Leaflet from 'leaflet';
	import { createMap, type MapHandle } from '$lib/map/createMap';
	import TextField from '$lib/components/TextField.svelte';

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

<div class="space-y-2.5">
	<!-- TODO: backend — no geocoding endpoint; the address is stored as typed and the
	     coordinates come from clicking the map. -->
	<TextField
		label="Address"
		bind:value={address}
		placeholder="e.g. Carrer de Colón 12, Valencia"
		hint="Type the address, then click on the map to drop a pin for the location."
		{error}
	/>
	<div
		bind:this={container}
		role="application"
		aria-label="Click the map to set the task location"
		class="isolate h-72 w-full border border-line"
	></div>
</div>
