import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

const location = vi.hoisted(() => ({ url: new URL('http://localhost/') }));

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({ page: location }));

describe('Header', () => {
	it('shows visitors the Mission link next to Sign in and Register', () => {
		render(Header);

		expect(screen.getByRole('link', { name: 'Mission' })).toHaveAttribute('href', '/mission');
		expect(screen.getByRole('link', { name: 'Mission' })).not.toHaveAttribute('aria-current');
		expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
	});

	it('marks Mission as the current page on /mission', () => {
		location.url = new URL('http://localhost/mission');
		render(Header);

		expect(screen.getByRole('link', { name: 'Mission' })).toHaveAttribute('aria-current', 'page');
	});
});
