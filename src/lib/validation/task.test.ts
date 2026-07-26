import { describe, it, expect } from 'vitest';
import { validateTask } from './task';
import type { TaskCreationRequest } from '$lib/types/task';

const valid: TaskCreationRequest = {
	title: 'Move a sofa',
	description: 'Need a hand carrying a sofa downstairs.',
	category: 'Transport Goods',
	location: { address: 'Carrer de Colón 12', lat: 39.47, lon: -0.38 }
};

describe('validateTask', () => {
	it('returns no errors for valid input', () => {
		expect(validateTask(valid)).toEqual({});
	});

	it('requires a title', () => {
		expect(validateTask({ ...valid, title: '  ' })).toHaveProperty('title');
	});

	it('requires a description', () => {
		expect(validateTask({ ...valid, description: '' })).toHaveProperty('description');
	});

	it('requires a category', () => {
		expect(validateTask({ ...valid, category: '' })).toHaveProperty('category');
	});

	it('requires an address and coordinates', () => {
		expect(
			validateTask({ ...valid, location: { address: '', lat: 39, lon: -0.3 } })
		).toHaveProperty('location');
		expect(
			validateTask({ ...valid, location: { address: 'x', lat: 'nope', lon: '' } })
		).toHaveProperty('location');
	});
});
