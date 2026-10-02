import { describe, it, expect } from 'vitest';
import { createMap } from './createMap';

function container() {
	const el = document.createElement('div');
	// Leaflet reads the container's size on init; jsdom reports 0 without this.
	Object.defineProperty(el, 'clientWidth', { value: 800 });
	Object.defineProperty(el, 'clientHeight', { value: 600 });
	document.body.appendChild(el);
	return el;
}

describe('createMap', () => {
	it('builds a map centred where asked', async () => {
		const handle = await createMap(container(), { center: [39.47, -0.38], zoom: 12 });

		expect(handle).not.toBeNull();
		expect(handle!.map.getZoom()).toBe(12);
		expect(handle!.map.getCenter().lat).toBeCloseTo(39.47);
		expect(handle!.map.getCenter().lng).toBeCloseTo(-0.38);
		handle!.map.remove();
	});

	it('attaches an OpenStreetMap tile layer with attribution', async () => {
		const el = container();
		const handle = await createMap(el, { center: [0, 0], zoom: 2 });

		let tileUrl: string | undefined;
		handle!.map.eachLayer((layer) => {
			const url = (layer as { _url?: string })._url;
			if (url) tileUrl = url;
		});

		expect(tileUrl).toContain('tile.openstreetmap.org');
		expect(el.querySelector('.leaflet-control-attribution')?.textContent).toContain(
			'OpenStreetMap'
		);
		handle!.map.remove();
	});

	it('uses the marker pin asset anchored on its tip', async () => {
		const handle = await createMap(container(), { center: [0, 0], zoom: 2 });

		expect(handle!.icon.options.iconUrl).toBe('/home/marker.svg');
		expect(handle!.icon.options.iconAnchor).toEqual([8, 20]);
		handle!.map.remove();
	});

	it('builds nothing when aborted before the library loads', async () => {
		const aborter = new AbortController();
		aborter.abort();

		const el = container();
		const handle = await createMap(el, { center: [0, 0], zoom: 2, signal: aborter.signal });

		expect(handle).toBeNull();
		expect(el.querySelector('.leaflet-container')).toBeNull();
	});
});
