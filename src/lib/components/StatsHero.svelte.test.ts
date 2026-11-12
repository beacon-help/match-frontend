import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import StatsHero from './StatsHero.svelte';
import type { Stats } from '$lib/types/stats';

const stats: Stats = {
	tasks: { total: 214, successful: 128, in_progress: 41 },
	users: { total_helpers: 312, total_help_seekers: 97 }
};

describe('StatsHero', () => {
	it('shows the fixed headline and the stats sentence', () => {
		render(StatsHero, { props: { stats, role: null } });

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			'Neighbours helping neighbours after the DANA.'
		);
		expect(
			screen.getByText(
				'128 requests for help completed — and 312 volunteers ready for the next one.'
			)
		).toBeInTheDocument();
	});

	it('invites a first request when the stats are missing', () => {
		render(StatsHero, { props: { stats: null, role: null } });

		expect(screen.getByText(/^Post what you need/)).toBeInTheDocument();
	});

	it('offers both sign-up paths to visitors', () => {
		render(StatsHero, { props: { stats: null, role: null } });

		expect(screen.getByRole('link', { name: 'Sign up to volunteer' })).toHaveAttribute(
			'href',
			'/signup/volunteer'
		);
		expect(screen.getByRole('link', { name: 'Sign up to get help' })).toHaveAttribute(
			'href',
			'/signup/helpseeker'
		);
		expect(screen.getByRole('link', { name: 'I need help' })).toHaveAttribute(
			'href',
			'/signup/helpseeker'
		);
	});

	it('sends a volunteer to the task search', () => {
		render(StatsHero, { props: { stats, role: 'volunteer' } });

		expect(screen.getByRole('link', { name: 'Find a task' })).toHaveAttribute(
			'href',
			'/tasks/search'
		);
		expect(screen.queryByRole('link', { name: 'Sign up to get help' })).not.toBeInTheDocument();
	});

	it('sends a help seeker to create a task', () => {
		render(StatsHero, { props: { stats, role: 'help-seeker' } });

		expect(screen.getByRole('link', { name: 'Ask for help' })).toHaveAttribute(
			'href',
			'/tasks/create'
		);
	});
});
