<script lang="ts">
	import type { Signup } from '$lib/types/signup';
	import type { SignupErrors } from '$lib/validation/signup';

	interface Props {
		signup: Signup;
		errors?: SignupErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { signup, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Create your account</h2>

	<form class="space-y-4" onsubmit={onSubmit}>
		{#if submitError}
			<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
				{submitError}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="first-name"
					>First name</label
				>
				<input
					id="first-name"
					type="text"
					bind:value={signup.firstName}
					placeholder="e.g. Alex"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#if errors.firstName}
					<p class="mt-1 text-sm text-red-600">{errors.firstName}</p>
				{/if}
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="last-name">Last name</label
				>
				<input
					id="last-name"
					type="text"
					bind:value={signup.lastName}
					placeholder="e.g. Johnson"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				{#if errors.lastName}
					<p class="mt-1 text-sm text-red-600">{errors.lastName}</p>
				{/if}
			</div>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={signup.email}
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
				bind:value={signup.password}
				placeholder="At least 8 characters"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
			{#if errors.password}
				<p class="mt-1 text-sm text-red-600">{errors.password}</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isSubmitting ? 'Creating account…' : 'Create account'}
		</button>
	</form>
</div>
