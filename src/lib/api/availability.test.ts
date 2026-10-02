import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isServerUp, safeReturnPath, shouldShowUnavailable } from './availability';

describe('safeReturnPath', () => {
	it('keeps a same-site path with its query', () => {
		expect(safeReturnPath('/tasks/42?tab=offers')).toBe('/tasks/42?tab=offers');
	});

	it.each([null, '', 'https://evil.example', '//evil.example', '/unavailable?from=/x'])(
		'falls back to home for %s',
		(from) => {
			expect(safeReturnPath(from)).toBe('/');
		}
	);
});

describe('isServerUp', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('is true when /health answers OK', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		expect(await isServerUp()).toBe(true);
		expect(vi.mocked(fetch).mock.calls[0][0]).toBe('http://localhost:8000/health');
	});

	it('is false when /health returns an error', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

		expect(await isServerUp()).toBe(false);
	});

	it('is false when /health gets no response', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

		expect(await isServerUp()).toBe(false);
	});
});

describe('shouldShowUnavailable', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('is true when the server is down', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

		expect(await shouldShowUnavailable('/tasks/42')).toBe(true);
	});

	it('is false when the health check passes', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);

		expect(await shouldShowUnavailable('/tasks/42')).toBe(false);
	});

	it('is false when already on the unavailable page', async () => {
		expect(await shouldShowUnavailable('/unavailable')).toBe(false);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('runs one health check for failures that arrive together', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

		const results = await Promise.all([
			shouldShowUnavailable('/tasks/42'),
			shouldShowUnavailable('/tasks/42')
		]);

		expect(results).toEqual([true, false]);
		expect(fetch).toHaveBeenCalledOnce();
	});
});
