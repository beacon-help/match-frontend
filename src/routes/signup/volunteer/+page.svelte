<script lang="ts">
	import VolunteerSignupForm from '$lib/components/VolunteerSignupForm.svelte';
	import { signupVolunteer } from '$lib/api/user';
	import { describeApiError } from '$lib/api/client';
	import {
		validateVolunteerSignup,
		type VolunteerSignupErrors
	} from '$lib/validation/volunteerSignup';
	import type { VolunteerSignup } from '$lib/types/signup';

	let signup: VolunteerSignup = $state({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		properties: []
	});
	let errors: VolunteerSignupErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);
	let succeeded = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validateVolunteerSignup(signup);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			await signupVolunteer(signup);
			succeeded = true;
		} catch (err) {
			submitError = describeApiError(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Sign up to volunteer</h3>

	{#if succeeded}
		<p class="text-lg text-green-700">Account created! Check your email to verify your account.</p>
	{:else}
		<VolunteerSignupForm {signup} {errors} {isSubmitting} {submitError} onSubmit={handleSubmit} />
	{/if}
</section>
