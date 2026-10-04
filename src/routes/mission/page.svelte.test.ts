import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';
import { MISSION_QUESTIONS } from '$lib/mission/faq';

vi.mock('virtual:match-config', () => ({
	default: { contact_email: 'team@example.org' }
}));

describe('/mission', () => {
	it('states the mission', () => {
		render(Page);

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			'Every request for help in Valencia should find someone who can answer it.'
		);
	});

	it('lists every question, with only the first one open', () => {
		const { container } = render(Page);

		for (const { question } of MISSION_QUESTIONS) {
			expect(screen.getByText(question)).toBeInTheDocument();
		}
		const open = container.querySelectorAll('details[open]');
		expect(open).toHaveLength(1);
		expect(open[0]).toHaveTextContent(MISSION_QUESTIONS[0].question);
	});

	it('offers both sign-up paths', () => {
		render(Page);

		expect(screen.getByText('I want to help').closest('a')).toHaveAttribute(
			'href',
			'/signup/volunteer'
		);
		expect(screen.getByText('I need help').closest('a')).toHaveAttribute(
			'href',
			'/signup/helpseeker'
		);
	});

	it('links to the contact email from the config', () => {
		render(Page);

		expect(screen.getByRole('link', { name: 'team@example.org' })).toHaveAttribute(
			'href',
			'mailto:team@example.org'
		);
	});
});
