import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PasswordInput from './PasswordInput.svelte';

function input(container: HTMLElement) {
	return container.querySelector('input')!;
}

describe('PasswordInput', () => {
	it('shows the password by default', () => {
		const { container } = render(PasswordInput, { props: { id: 'pw', value: 'secret' } });

		expect(input(container)).toHaveAttribute('type', 'text');
		expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
	});

	it('can start hidden and be revealed', async () => {
		const { container } = render(PasswordInput, {
			props: { id: 'pw', value: 'secret', visible: false }
		});

		expect(input(container)).toHaveAttribute('type', 'password');

		await fireEvent.click(screen.getByRole('button', { name: 'Show' }));

		expect(input(container)).toHaveAttribute('type', 'text');
		expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
	});
});
