import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('renders the hero intro copy', () => {
		render(Page);
		expect(screen.getByText(/On November 4, 2025/)).toBeInTheDocument();
	});
});
