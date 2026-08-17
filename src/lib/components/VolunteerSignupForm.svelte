<script lang="ts">
	import type { VolunteerSignup } from '$lib/types/signup';
	import type { VolunteerProperties } from '$lib/api/user';
	import type { VolunteerSignupErrors } from '$lib/validation/volunteerSignup';
	import TextField from '$lib/components/TextField.svelte';

	interface Props {
		signup: VolunteerSignup;
		errors?: VolunteerSignupErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		onSubmit: (event: SubmitEvent) => void;
	}

	let { signup, errors = {}, isSubmitting = false, submitError = null, onSubmit }: Props = $props();

	const PROPERTY_OPTIONS: { value: VolunteerProperties; label: string }[] = [
		{ value: 'HAS_CAR', label: 'I have a car' },
		{ value: 'CAN_HOST', label: 'I can host people' },
		{ value: 'CAN_WORK_PHYSICAL', label: 'I can do physical work' },
		{ value: 'HAS_TOOLS', label: 'I have tools' }
	];

	function toggle(property: VolunteerProperties) {
		if (signup.properties.includes(property)) {
			signup.properties = signup.properties.filter((p) => p !== property);
		} else {
			signup.properties = [...signup.properties, property];
		}
	}
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Create your volunteer account</h2>

	<form class="space-y-4" onsubmit={onSubmit}>
		{#if submitError}
			<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
				{submitError}
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<TextField
				label="First name"
				bind:value={signup.firstName}
				placeholder="e.g. Sam"
				error={errors.firstName}
			/>
			<TextField
				label="Surname"
				bind:value={signup.lastName}
				placeholder="e.g. Rivera"
				error={errors.lastName}
			/>
		</div>

		<TextField
			label="Email"
			type="email"
			bind:value={signup.email}
			placeholder="e.g. sam@example.com"
			error={errors.email}
		/>

		<TextField
			label="Password"
			type="password"
			bind:value={signup.password}
			placeholder="At least 8 characters"
			error={errors.password}
		/>

		<fieldset class="flex flex-col gap-2">
			<legend class="mb-1 text-sm font-medium text-gray-700">How can you help?</legend>
			{#each PROPERTY_OPTIONS as option (option.value)}
				<label class="flex items-center gap-2 text-sm text-gray-700">
					<input
						type="checkbox"
						checked={signup.properties.includes(option.value)}
						onchange={() => toggle(option.value)}
						class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					{option.label}
				</label>
			{/each}
		</fieldset>

		<button
			type="submit"
			disabled={isSubmitting}
			class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{isSubmitting ? 'Creating account…' : 'Create account'}
		</button>
	</form>
</div>
