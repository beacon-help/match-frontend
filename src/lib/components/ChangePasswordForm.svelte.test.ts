import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import ChangePasswordForm from './ChangePasswordForm.svelte';
import { ApiError } from '$lib/api/client';
import { changePassword } from '$lib/api/user';

vi.mock('virtual:match-config', () => ({
	default: { api_base_url: 'http://api.test' }
}));

function updateButton() {
	return screen.getByRole('button', { name: 'Update password' });
}

function field(label: 'Current password' | 'New password' | 'Repeat new password') {
	return screen.getByLabelText(label);
}

async function type(
	label: 'Current password' | 'New password' | 'Repeat new password',
	value: string
) {
	await fireEvent.input(field(label), { target: { value } });
}

async function fillValid() {
	await type('Current password', 'old-secret');
	await type('New password', 'new-secret');
	await type('Repeat new password', 'new-secret');
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('ChangePasswordForm', () => {
	it('keeps Update password disabled and hides Unsaved until a field has text', async () => {
		render(ChangePasswordForm, { props: { onSubmit: vi.fn() } });

		expect(updateButton()).toBeDisabled();
		expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();

		await type('Repeat new password', 'x');

		expect(updateButton()).toBeEnabled();
		expect(screen.getByText('Unsaved')).toBeInTheDocument();

		await type('Repeat new password', '');

		expect(updateButton()).toBeDisabled();
		expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
	});

	it('hides every password, with Show only on the new and repeated one', async () => {
		render(ChangePasswordForm, { props: { onSubmit: vi.fn() } });

		expect(field('Current password')).toHaveAttribute('type', 'password');
		expect(field('New password')).toHaveAttribute('type', 'password');
		expect(field('Repeat new password')).toHaveAttribute('type', 'password');

		const showButtons = screen.getAllByRole('button', { name: 'Show' });
		expect(showButtons.map((button) => button.getAttribute('aria-controls'))).toEqual([
			field('New password').id,
			field('Repeat new password').id
		]);

		await fireEvent.click(showButtons[0]);

		expect(field('New password')).toHaveAttribute('type', 'text');
		expect(field('Repeat new password')).toHaveAttribute('type', 'password');
	});

	it('shows every validation error at once and focuses the first', async () => {
		const onSubmit = vi.fn();
		render(ChangePasswordForm, { props: { onSubmit } });

		await type('New password', 'short');
		await fireEvent.click(updateButton());

		expect(await screen.findByText('Enter your current password.')).toBeInTheDocument();
		expect(screen.getByText('Use at least 8 characters.')).toBeInTheDocument();
		expect(screen.getByText("This doesn't match the new password.")).toBeInTheDocument();
		await waitFor(() => expect(field('Current password')).toHaveFocus());
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('asks for a new password that differs from the current one', async () => {
		render(ChangePasswordForm, { props: { onSubmit: vi.fn() } });

		await type('Current password', 'old-secret');
		await type('New password', 'old-secret');
		await type('Repeat new password', 'old-secret');
		await fireEvent.click(updateButton());

		expect(field('New password')).toHaveAccessibleDescription(
			'At least 8 characters. Pick something different from your current password.'
		);
		await waitFor(() => expect(field('New password')).toHaveFocus());
	});

	it('asks for a repeated password that matches', async () => {
		render(ChangePasswordForm, { props: { onSubmit: vi.fn() } });

		await type('Current password', 'old-secret');
		await type('New password', 'new-secret');
		await type('Repeat new password', 'new-secrets');
		await fireEvent.click(updateButton());

		expect(field('Repeat new password')).toHaveAccessibleDescription(
			"This doesn't match the new password."
		);
		await waitFor(() => expect(field('Repeat new password')).toHaveFocus());
	});

	it('sends only the current and new password, then clears and hides the fields', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		render(ChangePasswordForm, { props: { onSubmit } });

		await fillValid();
		for (const button of screen.getAllByRole('button', { name: 'Show' })) {
			await fireEvent.click(button);
		}
		await fireEvent.click(updateButton());

		expect(onSubmit).toHaveBeenCalledWith({
			currentPassword: 'old-secret',
			newPassword: 'new-secret'
		});
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('✓ Password updated'));
		expect(field('Current password')).toHaveValue('');
		expect(field('New password')).toHaveValue('');
		expect(field('Repeat new password')).toHaveValue('');
		expect(field('New password')).toHaveAttribute('type', 'password');
		expect(field('Repeat new password')).toHaveAttribute('type', 'password');
		expect(screen.queryByText('Unsaved')).not.toBeInTheDocument();
		expect(updateButton()).toBeDisabled();
	});

	it('shows a 400 from the server under Current password', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 400,
				json: async () => ({ detail: 'Current password is incorrect.' })
			} as Response)
		);
		render(ChangePasswordForm, {
			props: { onSubmit: (update) => changePassword(update, 'tok') }
		});

		await fillValid();
		await fireEvent.click(updateButton());

		await waitFor(() =>
			expect(field('Current password')).toHaveAccessibleDescription(
				'Current password is incorrect.'
			)
		);
		await waitFor(() => expect(field('Current password')).toHaveFocus());
		expect(field('New password')).toHaveValue('new-secret');
	});

	it('reports any other failure in the note', async () => {
		const onSubmit = vi.fn().mockRejectedValue(new ApiError('Network error', 0));
		render(ChangePasswordForm, { props: { onSubmit } });

		await fillValid();
		await fireEvent.click(updateButton());

		await waitFor(() =>
			expect(screen.getByRole('status')).toHaveTextContent(
				'Unable to reach the server, check your connection.'
			)
		);
	});
});
