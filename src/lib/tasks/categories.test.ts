import { describe, it, expect, vi } from 'vitest';
import { categoryLabel } from './categories';

vi.mock('virtual:match-config', () => ({
	default: { task_categories: [{ value: 'clean', label: 'Cleaning' }] }
}));

describe('categoryLabel', () => {
	it('shows the configured label', () => {
		expect(categoryLabel('clean')).toBe('Cleaning');
	});

	it('falls back to the raw value for an unknown category', () => {
		expect(categoryLabel('boat rescue')).toBe('boat rescue');
	});
});
