import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, describeApiError, ApiError } from './client';

function mockFetchResponse(status: number, body: unknown) {
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => body
	} as Response;
}

describe('apiFetch', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns parsed JSON on success', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(200, { id: 1 }));

		const result = await apiFetch<{ id: number }>('/foo');

		expect(result).toEqual({ id: 1 });
	});

	it('returns undefined on 204', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(204, undefined));

		const result = await apiFetch('/foo');

		expect(result).toBeUndefined();
	});

	it('throws ApiError with detail on 422', async () => {
		const detail = [{ loc: ['body', 'email'], msg: 'invalid email', type: 'value_error' }];
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(422, { detail }));

		await expect(apiFetch('/foo')).rejects.toMatchObject({
			status: 422,
			detail
		});
	});

	it('throws a generic ApiError on other non-2xx statuses', async () => {
		vi.mocked(fetch).mockResolvedValue(mockFetchResponse(500, {}));

		await expect(apiFetch('/foo')).rejects.toMatchObject({ status: 500 });
	});

	it('throws ApiError with status 0 on a network failure', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('network down'));

		await expect(apiFetch('/foo')).rejects.toMatchObject({ status: 0 });
	});
});

describe('describeApiError', () => {
	it('describes a network failure', () => {
		expect(describeApiError(new ApiError('Network error', 0))).toBe(
			'Unable to reach the server, check your connection.'
		);
	});

	it('describes a validation error using the detail messages', () => {
		const err = new ApiError('Validation failed', 422, [
			{ loc: ['body', 'email'], msg: 'invalid email', type: 'value_error' }
		]);

		expect(describeApiError(err)).toBe('invalid email');
	});

	it('describes any other error generically', () => {
		expect(describeApiError(new ApiError('boom', 500))).toBe(
			'Something went wrong, please try again.'
		);
	});

	it('describes a non-ApiError generically', () => {
		expect(describeApiError(new Error('boom'))).toBe('Something went wrong, please try again.');
	});
});
