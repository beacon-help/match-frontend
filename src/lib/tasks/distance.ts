import type { Location } from '$lib/types/task';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

// Great-circle distance in kilometres between two points. Used for client-side radius
// filtering on the Search page (the backend has no geo-filter endpoint).
export function haversineKm(
	a: { lat: number; lon: number },
	b: { lat: number; lon: number }
): number {
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lon - a.lon);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);

	const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
	return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// Parses a Location's lat/lon (which may arrive as strings) into numbers, or null if either
// is not finite.
export function locationLatLon(location: Location): { lat: number; lon: number } | null {
	const lat = Number(location.lat);
	const lon = Number(location.lon);
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
	return { lat, lon };
}
