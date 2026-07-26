<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { loginUser } from '$lib/api/user';
	import { saveTokens } from '$lib/auth/tokens';
	import { loadSession } from '$lib/auth/session.svelte';
	import { ApiError, describeApiError } from '$lib/api/client';
	import { validateLogin, type LoginErrors } from '$lib/validation/login';
	import type { Login } from '$lib/types/login';

	let login: Login = $state({
		email: '',
		password: ''
	});
	let errors: LoginErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validateLogin(login);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			const tokens = await loginUser(login);
			saveTokens(tokens);
			await loadSession();
			await goto(resolve('/'));
		} catch (err) {
			// The backend answers bad credentials with 401; give that its own message rather
			// than the generic fallback.
			submitError =
				err instanceof ApiError && err.status === 401
					? 'Incorrect email or password.'
					: describeApiError(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Sign in</h3>

	<LoginForm {login} {errors} {isSubmitting} {submitError} onSubmit={handleSubmit} />
</section>
