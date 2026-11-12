<script lang="ts">
	import config from 'virtual:match-config';
	import type { VolunteerSignup } from '$lib/types/signup';
	import type { VolunteerSignupErrors } from '$lib/validation/volunteerSignup';
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';
	import CheckboxOption from '$lib/components/CheckboxOption.svelte';

	interface Props {
		signup: VolunteerSignup;
		errors?: VolunteerSignupErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { signup, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();

	function toggle(property: string) {
		if (signup.properties.includes(property)) {
			signup.properties = signup.properties.filter((p) => p !== property);
		} else {
			signup.properties = [...signup.properties, property];
		}
	}
</script>

<form class="max-w-xl space-y-6" onsubmit={onSubmit}>
	{#if submitError}
		<Inset tone="error">{submitError}</Inset>
	{/if}

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<TextField
			label="First name"
			bind:value={signup.firstName}
			autocomplete="given-name"
			error={errors.firstName}
		/>
		<TextField
			label="Surname"
			bind:value={signup.lastName}
			autocomplete="family-name"
			error={errors.lastName}
		/>
	</div>

	<TextField
		label="Email"
		type="email"
		bind:value={signup.email}
		autocomplete="email"
		error={errors.email}
	/>

	<TextField
		label="Password"
		type="password"
		bind:value={signup.password}
		autocomplete="new-password"
		hint="At least 8 characters."
		error={errors.password}
	/>

	<fieldset>
		<legend class="mb-1.5 font-semibold">How can you help?</legend>
		{#each config.volunteer_properties as option (option.value)}
			<CheckboxOption
				label={option.label}
				checked={signup.properties.includes(option.value)}
				onchange={() => toggle(option.value)}
			/>
		{/each}
	</fieldset>

	<Button variant="primary" type="submit" disabled={isSubmitting}>
		{isSubmitting ? 'Creating account…' : 'Create account'}
	</Button>
</form>
