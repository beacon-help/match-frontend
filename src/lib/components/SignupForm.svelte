<script lang="ts">
	import type { Signup } from '$lib/types/signup';
	import type { SignupErrors } from '$lib/validation/signup';
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';

	interface Props {
		signup: Signup;
		errors?: SignupErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { signup, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();
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
			label="Last name"
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

	<Button variant="primary" type="submit" disabled={isSubmitting}>
		{isSubmitting ? 'Creating account…' : 'Create account'}
	</Button>
</form>
