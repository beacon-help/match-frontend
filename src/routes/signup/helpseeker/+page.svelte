<script lang="ts">
	import SignupForm from '$lib/components/SignupForm.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Inset from '$lib/components/Inset.svelte';
	import { signupHelpseeker } from '$lib/api/user';
	import { describeApiError } from '$lib/api/client';
	import { validateSignup, type SignupErrors } from '$lib/validation/signup';
	import type { Signup } from '$lib/types/signup';

	let signup: Signup = $state({
		firstName: '',
		lastName: '',
		email: '',
		password: ''
	});
	let errors: SignupErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let succeeded = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validateSignup(signup);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			await signupHelpseeker(signup);
			succeeded = true;
		} catch (err) {
			submitError = describeApiError(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Page>
	<PageHeader title="Sign up to get help" />

	{#if succeeded}
		<Inset>Account created. Check your email to verify your account.</Inset>
	{:else}
		<SignupForm {signup} {errors} {isSubmitting} {submitError} onSubmit={handleSubmit} />
	{/if}
</Page>
