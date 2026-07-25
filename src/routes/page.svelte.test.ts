import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('renders the hero intro copy', () => {
		render(Page);
		expect(screen.getByText(/On November 4, 2025/)).toBeInTheDocument();
	});

	test('renders affected municipalities in bold', () => {
		render(Page);
		const torrent = screen.getByText('Torrent');
		expect(torrent).toBeInTheDocument();
		expect(torrent.tagName).toBe('STRONG');
	});
});
