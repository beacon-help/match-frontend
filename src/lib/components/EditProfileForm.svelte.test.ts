import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import EditProfileForm from './EditProfileForm.svelte';
import { ApiError } from '$lib/api/client';
import { updateMe, type UserSchema } from '$lib/api/user';

vi.mock('virtual:match-config', () => ({
	default: {
		api_base_url: 'http://api.test',
		volunteer_properties: [
			{ value: 'has_car', label: 'I have a car' },
			{ value: 'has_tools', label: 'I have tools' }
		]
	}
}));

const volunteer: UserSchema = {
	id: 1,
	first_name: 'Marta',
	last_name: 'Kowalczyk',
	email: 'marta@example.com',
	is_verified: true,
	user_type: 'volunteer',
	properties: ['has_car']
};

const helpSeeker: UserSchema = { ...volunteer, user_type: 'help-seeker', properties: [] };

function saveButton() {
	return screen.getByRole('button', { name: 'Save changes' });
}

function note() {
	return screen.getByRole('status');
}

async function type(label: string, value: string) {
	await fireEvent.input(screen.getByLabelText(label), { target: { value } });
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('EditProfileForm', () => {
	it('prefills the names, read-only email and ticks from the user', () => {
		render(EditProfileForm, { props: { user: volunteer, onSave: vi.fn() } });

		expect(screen.getByLabelText('First name')).toHaveValue('Marta');
		expect(screen.getByLabelText('Last name')).toHaveValue('Kowalczyk');
		expect(screen.getByLabelText('Email')).toHaveValue('marta@example.com');
		expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
		expect(screen.getByLabelText('Email')).toHaveAccessibleDescription(
			"Email can't be changed here."
		);
		expect(screen.getByLabelText('I have a car')).toBeChecked();
		expect(screen.getByLabelText('I have tools')).not.toBeChecked();
	});

	it('keeps Save changes disabled until something differs, counting each change', async () => {
		render(EditProfileForm, { props: { user: volunteer, onSave: vi.fn() } });

		expect(saveButton()).toBeDisabled();
		expect(note()).toHaveTextContent('No changes');

		await type('First name', 'Martha');
		expect(saveButton()).toBeEnabled();
		expect(note()).toHaveTextContent('1 unsaved change');

		await fireEvent.click(screen.getByLabelText('I have tools'));
		await fireEvent.click(screen.getByLabelText('I have a car'));
		expect(note()).toHaveTextContent('3 unsaved changes');

		await type('First name', 'Marta');
		expect(note()).toHaveTextContent('2 unsaved changes');

		await fireEvent.click(screen.getByLabelText('I have tools'));
		await fireEvent.click(screen.getByLabelText('I have a car'));
		expect(note()).toHaveTextContent('No changes');
		expect(saveButton()).toBeDisabled();
	});

	it('saves trimmed names and the full properties list for a volunteer', async () => {
		const onSave = vi.fn().mockResolvedValue({
			...volunteer,
			first_name: 'Martha',
			properties: ['has_car', 'has_tools']
		});
		render(EditProfileForm, { props: { user: volunteer, onSave } });

		await type('First name', ' Martha ');
		await fireEvent.click(screen.getByLabelText('I have tools'));
		await fireEvent.click(saveButton());

		expect(onSave).toHaveBeenCalledWith({
			firstName: 'Martha',
			lastName: 'Kowalczyk',
			properties: ['has_car', 'has_tools']
		});
		await waitFor(() => expect(note()).toHaveTextContent('✓ Profile saved'));
		expect(screen.getByLabelText('First name')).toHaveValue('Martha');
		expect(saveButton()).toBeDisabled();

		await fireEvent.change(screen.getByLabelText('First name'));
		expect(note()).toHaveTextContent('✓ Profile saved');

		await fireEvent.click(screen.getByLabelText('I have tools'));
		expect(note()).toHaveTextContent('1 unsaved change');
	});

	it('shows help-seekers no tick boxes and sends no properties', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				json: async () => ({ ...helpSeeker, first_name: 'Ana' })
			} as Response)
		);
		render(EditProfileForm, {
			props: { user: helpSeeker, onSave: (update) => updateMe(update, 'tok') }
		});

		expect(screen.queryByText('How can you help?')).not.toBeInTheDocument();
		expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

		await type('First name', 'Ana');
		await fireEvent.click(saveButton());

		await waitFor(() => expect(note()).toHaveTextContent('✓ Profile saved'));
		const [, init] = vi.mocked(fetch).mock.calls[0];
		expect(JSON.parse(init?.body as string)).toEqual({
			first_name: 'Ana',
			last_name: 'Kowalczyk'
		});
	});

	it('refuses empty names and focuses the first one', async () => {
		const onSave = vi.fn();
		render(EditProfileForm, { props: { user: volunteer, onSave } });

		await type('First name', '  ');
		await type('Last name', '');
		await fireEvent.click(saveButton());

		expect(await screen.findByText('Enter your first name.')).toBeInTheDocument();
		expect(screen.getByText('Enter your last name.')).toBeInTheDocument();
		expect(note()).toHaveTextContent('Nothing saved. Fix the fields in red.');
		await waitFor(() => expect(screen.getByLabelText('First name')).toHaveFocus());
		expect(onSave).not.toHaveBeenCalled();
	});

	it('restores the saved values and clears errors on Cancel', async () => {
		render(EditProfileForm, { props: { user: volunteer, onSave: vi.fn() } });

		await type('First name', '');
		await fireEvent.click(screen.getByLabelText('I have tools'));
		await fireEvent.click(saveButton());
		expect(await screen.findByText('Enter your first name.')).toBeInTheDocument();

		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(screen.getByLabelText('First name')).toHaveValue('Marta');
		expect(screen.getByLabelText('I have tools')).not.toBeChecked();
		expect(screen.queryByText('Enter your first name.')).not.toBeInTheDocument();
		expect(note()).toHaveTextContent('No changes');
		expect(saveButton()).toBeDisabled();
	});

	it('reports a failed save in the note', async () => {
		const onSave = vi
			.fn()
			.mockRejectedValue(
				new ApiError('Validation failed', 422, [
					{ loc: ['body', 'first_name'], msg: 'Name is too long.', type: 'value_error' }
				])
			);
		render(EditProfileForm, { props: { user: volunteer, onSave } });

		await type('First name', 'Martha');
		await fireEvent.click(saveButton());

		await waitFor(() => expect(note()).toHaveTextContent('Name is too long.'));
		expect(saveButton()).toBeEnabled();
	});
});
