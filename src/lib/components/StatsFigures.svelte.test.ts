import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import StatsFigures from './StatsFigures.svelte';

describe('StatsFigures', () => {
	it('pairs each value with its label', () => {
		render(StatsFigures, {
			props: {
				figures: [
					{ value: '128', label: 'requests completed' },
					{ value: '41', label: 'tasks underway now' }
				]
			}
		});

		expect(screen.getByText('128')).toBeInTheDocument();
		expect(screen.getByText('tasks underway now')).toBeInTheDocument();
	});
});
