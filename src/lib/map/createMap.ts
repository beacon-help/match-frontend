import type * as Leaflet from 'leaflet';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAX_ZOOM = 19;

// Reuse the wireframe's pin asset; anchor its tip (bottom-centre) on the point.
const ICON_OPTIONS = {
	iconUrl: '/home/marker.svg',
	iconSize: [16, 20],
	iconAnchor: [8, 20],
	popupAnchor: [0, -18]
} satisfies Leaflet.IconOptions;

export type MapHandle = {
	L: typeof Leaflet;
	map: Leaflet.Map;
	icon: Leaflet.Icon;
};

export type CreateMapOptions = {
	center: [number, number];
	zoom: number;
	/** Abort to skip construction when the caller unmounts during the import. */
	signal?: AbortSignal;
};

/**
 * Builds a Leaflet map on `container`, or returns null if `signal` aborted while the
 * library was loading — so an unmount mid-import leaves nothing to clean up.
 *
 * Leaflet touches `window`, so it is imported here rather than at module scope: this file
 * is imported statically by components that server-render.
 */
export async function createMap(
	container: HTMLElement,
	options: CreateMapOptions
): Promise<MapHandle | null> {
	const module = await import('leaflet');
	if (options.signal?.aborted) return null;

	const L = module.default;
	const map = L.map(container).setView(options.center, options.zoom);
	L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(map);

	return { L, map, icon: L.icon(ICON_OPTIONS) };
}
