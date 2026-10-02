<script lang="ts">
	interface Props {
		id: string;
		value: string;
		placeholder?: string;
	}

	let { id, value = $bindable(), placeholder = '' }: Props = $props();

	let showPassword = $state(true);

	function toggleShowPassword() {
		showPassword = !showPassword;
	}
</script>

<div class="relative">
	<input
		{id}
		type={showPassword ? 'text' : 'password'}
		bind:value
		{placeholder}
		class="w-full rounded-lg border border-gray-300 py-2 pr-16 pl-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
	/>
	<button
		type="button"
		onclick={toggleShowPassword}
		aria-pressed={showPassword}
		aria-controls={id}
		class="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700"
	>
		{showPassword ? 'Hide' : 'Show'}
	</button>
</div>
