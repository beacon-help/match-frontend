import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import TextField from './TextField.svelte';

describe('TextField', () => {
	it('describes the input with its hint and error', () => {
		render(TextField, {
			props: {
				label: 'New password',
				value: '',
				hint: 'At least 8 characters.',
				error: 'Too short.'
			}
		});

		const input = screen.getByLabelText('New password');
		expect(input).toHaveAccessibleDescription('At least 8 characters. Too short.');
		expect(input).toHaveAttribute('aria-invalid', 'true');
	});

	it('leaves a valid input unmarked', () => {
		render(TextField, { props: { label: 'First name', value: 'Marta' } });

		const input = screen.getByLabelText('First name');
		expect(input).not.toHaveAttribute('aria-invalid');
		expect(input).not.toHaveAttribute('aria-describedby');
	});

	it('can be read-only', () => {
		render(TextField, { props: { label: 'Email', type: 'email', value: 'a@b.c', readonly: true } });

		expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
	});

	it('offers a Show/Hide toggle on a password by default', () => {
		render(TextField, { props: { label: 'Password', type: 'password', value: '' } });

		expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
	});

	it('can render a password without a toggle', () => {
		render(TextField, {
			props: { label: 'Current password', type: 'password', value: '', revealable: false }
		});

		expect(screen.getByLabelText('Current password')).toHaveAttribute('type', 'password');
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('can start a revealable password hidden', () => {
		render(TextField, {
			props: { label: 'New password', type: 'password', value: '', visible: false }
		});

		expect(screen.getByLabelText('New password')).toHaveAttribute('type', 'password');
		expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
	});
});
