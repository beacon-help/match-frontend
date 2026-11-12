import { describe, it, expect } from 'vitest';
import { statusBadge } from './status';

describe('statusBadge', () => {
	it('words a pending task from the viewer’s side', () => {
		expect(statusBadge('pending', 'owner').label).toBe('Offer received');
		expect(statusBadge('pending', 'engaged').label).toBe('Offer sent');
		expect(statusBadge('pending').label).toBe('Offer pending');
	});

	it('shows failed and cancelled tasks as a neutral Closed', () => {
		expect(statusBadge('failed')).toEqual({ label: 'Closed', tone: 'neutral' });
		expect(statusBadge('cancelled')).toEqual({ label: 'Closed', tone: 'neutral' });
	});
});
