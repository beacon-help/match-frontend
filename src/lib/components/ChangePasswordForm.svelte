<script lang="ts">
	import { ApiError, describeApiError } from '$lib/api/client';
	import type { PasswordForm, PasswordUpdate } from '$lib/types/profile';
	import type { Note } from '$lib/types/note';
	import { validatePasswordChange, type PasswordErrors } from '$lib/validation/profile';
	import { focusFirstInvalid } from '$lib/forms/focusFirstInvalid';
	import TextField from '$lib/components/TextField.svelte';
	import FormNote from '$lib/components/FormNote.svelte';

	interface Props {
		/** Sends the change; rejects with the server's error. */
		onSubmit: (update: PasswordUpdate) => Promise<void>;
	}

	let { onSubmit }: Props = $props();

	let change: PasswordForm = $state(emptyPasswordForm());
	let errors: PasswordErrors = $state({});
	let outcome: Note | null = $state(null);
	let isSubmitting = $state(false);
	let newPasswordVisible = $state(false);
	let repeatPasswordVisible = $state(false);
	let form: HTMLFormElement;

	const hasText = $derived(
		change.currentPassword !== '' || change.newPassword !== '' || change.repeatPassword !== ''
	);
	const canSubmit = $derived(hasText && !isSubmitting);

	function emptyPasswordForm(): PasswordForm {
		return { currentPassword: '', newPassword: '', repeatPassword: '' };
	}

	function clearOutcome() {
		outcome = null;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validatePasswordChange(change);
		if (Object.keys(errors).length > 0) {
			await focusFirstInvalid(form);
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit({ currentPassword: change.currentPassword, newPassword: change.newPassword });
			change = emptyPasswordForm();
			newPasswordVisible = false;
			repeatPasswordVisible = false;
			outcome = { text: '✓ Password updated', tone: 'ok' };
		} catch (err) {
			if (err instanceof ApiError && err.status === 400 && err.serverMessage) {
				errors = { currentPassword: err.serverMessage };
				await focusFirstInvalid(form);
			} else {
				outcome = { text: describeApiError(err), tone: 'error' };
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<div class="mb-4 flex items-center justify-between gap-4">
		<h2 class="text-xl font-semibold text-gray-800">Password</h2>
		{#if hasText}
			<span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
				Unsaved
			</span>
		{/if}
	</div>

	<form
		bind:this={form}
		class="space-y-4"
		novalidate
		onsubmit={handleSubmit}
		oninput={clearOutcome}
	>
		<TextField
			label="Current password"
			type="password"
			bind:value={change.currentPassword}
			revealable={false}
			autocomplete="current-password"
			error={errors.currentPassword}
		/>
		<TextField
			label="New password"
			type="password"
			bind:value={change.newPassword}
			bind:visible={newPasswordVisible}
			autocomplete="new-password"
			hint="At least 8 characters."
			error={errors.newPassword}
		/>
		<TextField
			label="Repeat new password"
			type="password"
			bind:value={change.repeatPassword}
			bind:visible={repeatPasswordVisible}
			autocomplete="new-password"
			error={errors.repeatPassword}
		/>

		<div class="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
			<FormNote note={outcome} />
			<button
				type="submit"
				disabled={!canSubmit}
				class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Updating…' : 'Update password'}
			</button>
		</div>
	</form>
</div>
