<script lang="ts">
	import { ApiError, describeApiError } from '$lib/api/client';
	import type { PasswordForm, PasswordUpdate } from '$lib/types/profile';
	import type { Note } from '$lib/types/note';
	import { validatePasswordChange, type PasswordErrors } from '$lib/validation/profile';
	import { focusFirstInvalid } from '$lib/forms/focusFirstInvalid';
	import TextField from '$lib/components/TextField.svelte';
	import FormNote from '$lib/components/FormNote.svelte';
	import Button from '$lib/components/Button.svelte';
	import Tag from '$lib/components/Tag.svelte';

	interface Props {
		/** Sends the change; rejects with the server's error. */
		onSubmit: (update: PasswordUpdate) => Promise<void>;
	}

	let { onSubmit }: Props = $props();

	let change: PasswordForm = $state(emptyPasswordForm());
	let errors: PasswordErrors = $state({});
	let outcome: Note | null = $state(null);
	let isSubmitting = $state(false);
	let currentPasswordVisible = $state(false);
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
			currentPasswordVisible = false;
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

<section>
	<div class="mb-5 flex items-center justify-between gap-4 border-b-2 border-ink pb-2">
		<h2 class="text-2xl font-bold">Password</h2>
		{#if hasText}
			<Tag tone="wait">Unsaved</Tag>
		{/if}
	</div>

	<form
		bind:this={form}
		class="space-y-6"
		novalidate
		onsubmit={handleSubmit}
		oninput={clearOutcome}
	>
		<TextField
			label="Current password"
			type="password"
			bind:value={change.currentPassword}
			bind:visible={currentPasswordVisible}
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

		<div class="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
			<FormNote note={outcome} />
			<Button variant="primary" type="submit" disabled={!canSubmit}>
				{isSubmitting ? 'Updating…' : 'Update password'}
			</Button>
		</div>
	</form>
</section>
