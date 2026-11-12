import type * as Leaflet from 'leaflet';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const MAX_ZOOM = 19;

// Anchor the pin's tip (bottom-centre) on the point.
const ICON_OPTIONS = {
	iconUrl: '/home/marker.svg',
	iconSize: [22, 28],
	iconAnchor: [11, 28],
	popupAnchor: [0, -26]
} satisfies Leaflet.IconOptions;

export type MapHandle = {
	L: typeof Leaflet;
	map: Leaflet.Map;
	icon: Leaflet.Icon;
};

export type CreateMapOptions = {
	center: [number, number];
	zoom: number;
	/** On phones, leave one-finger drags to the page so the map cannot trap scrolling. */
	scrollsWithPage?: boolean;
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
	const dragging = !(options.scrollsWithPage && L.Browser.mobile);
	const map = L.map(container, { dragging }).setView(options.center, options.zoom);
	L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: MAX_ZOOM }).addTo(map);

	return { L, map, icon: L.icon(ICON_OPTIONS) };
}
