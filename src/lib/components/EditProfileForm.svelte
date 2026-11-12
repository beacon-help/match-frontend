<script lang="ts">
	import { untrack } from 'svelte';
	import config from 'virtual:match-config';
	import type { UserSchema } from '$lib/api/user';
	import { describeApiError } from '$lib/api/client';
	import type { ProfileForm, ProfileUpdate } from '$lib/types/profile';
	import type { Note } from '$lib/types/note';
	import { validateProfile, type ProfileErrors } from '$lib/validation/profile';
	import {
		countProfileChanges,
		describeUnsavedChanges,
		profileFormFrom,
		toProfileUpdate
	} from '$lib/profile/edit';
	import { focusFirstInvalid } from '$lib/forms/focusFirstInvalid';
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormNote from '$lib/components/FormNote.svelte';

	interface Props {
		user: UserSchema;
		/** Persists the update and resolves with the user as saved. */
		onSave: (update: ProfileUpdate) => Promise<UserSchema>;
	}

	let { user, onSave }: Props = $props();

	// Edits start from the user as loaded; after a save the server's copy replaces both.
	let saved: ProfileForm = $state(untrack(() => profileFormFrom(user)));
	let profile: ProfileForm = $state(untrack(() => profileFormFrom(user)));
	let errors: ProfileErrors = $state({});
	// The outcome of the last save attempt; it gives way to the change count once the user edits.
	let outcome: Note | null = $state(null);
	let isSaving = $state(false);
	let form: HTMLFormElement;

	const isVolunteer = $derived(user.user_type === 'volunteer');
	const changeCount = $derived(countProfileChanges(saved, profile));
	const canSave = $derived(changeCount > 0 && !isSaving);
	const note: Note = $derived(
		outcome ?? {
			text: describeUnsavedChanges(changeCount),
			tone: changeCount === 0 ? 'muted' : 'dirty'
		}
	);

	function toggle(property: string) {
		if (profile.properties.includes(property)) {
			profile.properties = profile.properties.filter((p) => p !== property);
		} else {
			profile.properties = [...profile.properties, property];
		}
	}

	function clearOutcome() {
		outcome = null;
	}

	function cancel() {
		profile = { ...saved, properties: [...saved.properties] };
		errors = {};
		outcome = null;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validateProfile(profile);
		if (Object.keys(errors).length > 0) {
			outcome = { text: 'Nothing saved. Fix the fields in red.', tone: 'error' };
			await focusFirstInvalid(form);
			return;
		}

		isSaving = true;
		try {
			const savedUser = await onSave(toProfileUpdate(profile, user.user_type));
			saved = profileFormFrom(savedUser);
			profile = profileFormFrom(savedUser);
			outcome = { text: '✓ Profile saved', tone: 'ok' };
		} catch (err) {
			outcome = { text: describeApiError(err), tone: 'error' };
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-xl font-semibold text-gray-800">Profile</h2>

	<form
		bind:this={form}
		class="space-y-4"
		novalidate
		onsubmit={handleSubmit}
		oninput={clearOutcome}
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<TextField
				label="First name"
				bind:value={profile.firstName}
				autocomplete="given-name"
				error={errors.firstName}
			/>
			<TextField
				label="Last name"
				bind:value={profile.lastName}
				autocomplete="family-name"
				error={errors.lastName}
			/>
		</div>

		<TextField
			label="Email"
			type="email"
			value={user.email}
			readonly
			hint="Email can't be changed here."
		/>

		{#if isVolunteer}
			<fieldset>
				<legend class="mb-1 text-sm font-medium text-gray-700">How can you help?</legend>
				<p class="mb-2 text-sm text-gray-500">We use this to suggest tasks that fit you.</p>
				<div class="divide-y divide-gray-200 rounded-lg border border-gray-200">
					{#each config.volunteer_properties as option (option.value)}
						<label class="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-gray-700">
							<input
								type="checkbox"
								checked={profile.properties.includes(option.value)}
								onchange={() => toggle(option.value)}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							{option.label}
						</label>
					{/each}
				</div>
			</fieldset>
		{/if}

		<div class="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
			<FormNote {note} />
			<Button variant="neutral" disabled={isSaving} onclick={cancel}>Cancel</Button>
			<button
				type="submit"
				disabled={!canSave}
				class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSaving ? 'Saving…' : 'Save changes'}
			</button>
		</div>
	</form>
</div>
