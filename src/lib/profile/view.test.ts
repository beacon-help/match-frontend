import { describe, it, expect, vi } from 'vitest';
import { propertyLabels, roleLabel } from './view';

vi.mock('virtual:match-config', () => ({
	default: {
		volunteer_properties: [
			{ value: 'has_car', label: 'I have a car' },
			{ value: 'has_tools', label: 'I have tools' }
		]
	}
}));

describe('roleLabel', () => {
	it('names both user types', () => {
		expect(roleLabel('volunteer')).toBe('Volunteer');
		expect(roleLabel('help-seeker')).toBe('Help-seeker');
	});
});

describe('propertyLabels', () => {
	it('uses the labels from the config', () => {
		expect(propertyLabels(['has_tools', 'has_car'])).toEqual(['I have tools', 'I have a car']);
	});

	it('falls back to the raw value for a property missing from the config', () => {
		expect(propertyLabels(['can_fly'])).toEqual(['can_fly']);
	});
});
