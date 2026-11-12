<script lang="ts">
	import type { Login } from '$lib/types/login';
	import type { LoginErrors } from '$lib/validation/login';
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';

	interface Props {
		login: Login;
		errors?: LoginErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { login, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();
</script>

<form class="max-w-md space-y-6" onsubmit={onSubmit}>
	{#if submitError}
		<Inset tone="error">{submitError}</Inset>
	{/if}

	<TextField
		label="Email"
		type="email"
		bind:value={login.email}
		autocomplete="email"
		error={errors.email}
	/>

	<TextField
		label="Password"
		type="password"
		bind:value={login.password}
		autocomplete="current-password"
		error={errors.password}
	/>

	<div class="flex flex-wrap items-center gap-x-5 gap-y-3">
		<Button variant="primary" type="submit" disabled={isSubmitting}>
			{isSubmitting ? 'Signing in…' : 'Sign in'}
		</Button>
		<!-- TODO: backend — no password reset endpoint yet; link is a mock placeholder. -->
		<button
			type="button"
			disabled
			class="text-base text-ink-soft"
			title="Password reset is not available yet"
		>
			Forgot password?
		</button>
	</div>
</form>
