<script lang="ts">
	import SignupForm from '$lib/components/SignupForm.svelte';
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

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Sign up to get help</h3>

	{#if succeeded}
		<p class="text-lg text-green-700">Account created! Check your email to verify your account.</p>
	{:else}
		<SignupForm {signup} {errors} {isSubmitting} {submitError} onSubmit={handleSubmit} />
	{/if}
</section>
