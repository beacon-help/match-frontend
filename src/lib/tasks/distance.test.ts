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
	it('parses string coordinates to numbers', () => {
		expect(locationLatLon({ address: 'x', lat: '39.47', lon: '-0.38' })).toEqual({
			lat: 39.47,
			lon: -0.38
		});
	});

	it('returns null for non-numeric coordinates', () => {
		expect(locationLatLon({ address: 'x', lat: 'abc', lon: '1' })).toBeNull();
	});
});
