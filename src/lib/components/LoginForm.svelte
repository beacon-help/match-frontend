<script lang="ts">
	import type { Login } from '$lib/types/login';
	import type { LoginErrors } from '$lib/validation/login';

	interface Props {
		login: Login;
		errors?: LoginErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { login, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Welcome back</h2>

	<form class="space-y-4" onsubmit={onSubmit}>
		{#if submitError}
			<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
				{submitError}
			</div>
		{/if}

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={login.email}
				placeholder="e.g. alex@example.com"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			{#if errors.email}
				<p class="mt-1 text-sm text-red-600">{errors.email}</p>
			{/if}
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="password">Password</label>
			<input
				id="password"
				type="password"
				bind:value={login.password}
				placeholder="Your password"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			{#if errors.password}
				<p class="mt-1 text-sm text-red-600">{errors.password}</p>
			{/if}
			<!-- TODO: backend — no password reset endpoint yet; link is a mock placeholder. -->
			<div class="mt-1 text-right">
				<button
					type="button"
					disabled
					class="text-sm font-medium text-gray-400"
					title="Password reset is not available yet"
				>
					Forgot password?
				</button>
			</div>
		</div>

		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isSubmitting ? 'Signing in…' : 'Sign in'}
		</button>
	</form>
</div>
