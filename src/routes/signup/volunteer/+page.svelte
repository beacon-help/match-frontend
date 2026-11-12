<script lang="ts">
	import VolunteerSignupForm from '$lib/components/VolunteerSignupForm.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Inset from '$lib/components/Inset.svelte';
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

<Page>
	<PageHeader title="Sign up to volunteer" />

	{#if succeeded}
		<Inset>Account created. Check your email to verify your account.</Inset>
	{:else}
		<VolunteerSignupForm {signup} {errors} {isSubmitting} {submitError} onSubmit={handleSubmit} />
	{/if}
</Page>
