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
	it('shows the stats headline and the live count', () => {
		render(StatsHero, { props: { stats, role: null } });

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
			'128 requests for help completed — and 312 volunteers ready for the next one.'
		);
		expect(screen.getByText('41 tasks underway right now')).toBeInTheDocument();
	});

	it('hides the live count when nothing is underway', () => {
		render(StatsHero, {
			props: { stats: { ...stats, tasks: { ...stats.tasks, in_progress: 0 } }, role: null }
		});

		expect(screen.queryByText(/underway right now/)).not.toBeInTheDocument();
	});

	it('offers both sign-up paths to visitors', () => {
		render(StatsHero, { props: { stats: null, role: null } });

		expect(screen.getByRole('link', { name: 'I want to help' })).toHaveAttribute(
			'href',
			'/signup/volunteer'
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
		expect(screen.queryByRole('link', { name: 'I need help' })).not.toBeInTheDocument();
	});

	it('sends a help seeker to create a task', () => {
		render(StatsHero, { props: { stats, role: 'help-seeker' } });

		expect(screen.getByRole('link', { name: 'Create a task' })).toHaveAttribute(
			'href',
			'/tasks/create'
		);
	});
});
