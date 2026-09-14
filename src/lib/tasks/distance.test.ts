import { describe, it, expect } from 'vitest';
import { haversineKm, locationLatLon } from './distance';

describe('haversineKm', () => {
	it('is zero for identical points', () => {
		expect(haversineKm({ lat: 39.47, lon: -0.38 }, { lat: 39.47, lon: -0.38 })).toBeCloseTo(0);
	});

	it('approximates a known distance (Valencia → Madrid ≈ 300km)', () => {
		const d = haversineKm({ lat: 39.47, lon: -0.38 }, { lat: 40.42, lon: -3.7 });
		expect(d).toBeGreaterThan(280);
		expect(d).toBeLessThan(320);
	});
});

describe('locationLatLon', () => {
	it('returns the coordinates for a usable location', () => {
		expect(locationLatLon({ address: 'x', lat: 39.47, lon: -0.38 })).toEqual({
			lat: 39.47,
			lon: -0.38
		});
	});

	it('returns null when a coordinate is not finite', () => {
		expect(locationLatLon({ address: 'x', lat: NaN, lon: 1 })).toBeNull();
		expect(locationLatLon({ address: 'x', lat: 1, lon: NaN })).toBeNull();
	});

	it('keeps a legitimate zero coordinate', () => {
		expect(locationLatLon({ address: 'x', lat: 0, lon: 0 })).toEqual({ lat: 0, lon: 0 });
	});
});
