import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { goto } from '$app/navigation';
import Page from './+page.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/unavailable?from=%2Ftasks%2F42') }
}));

describe('/unavailable', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.mocked(goto).mockReset();
	});

	it('points people to 112 for urgent help', () => {
		render(Page);

		expect(screen.getByText('Need help urgently?')).toBeInTheDocument();
		expect(screen.getByText('112')).toBeInTheDocument();
	});

	it('goes back to the previous page once the server answers', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true } as Response);
		render(Page);

		await fireEvent.click(screen.getByText('Try again'));

		await vi.waitFor(() => expect(goto).toHaveBeenCalledWith('/tasks/42'));
	});

	it('stays put while the server is still down', async () => {
		vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
		render(Page);

		await fireEvent.click(screen.getByText('Try again'));

		await vi.waitFor(() => expect(screen.getByText('Try again')).toBeEnabled());
		expect(goto).not.toHaveBeenCalled();
	});
});
