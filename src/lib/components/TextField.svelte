<script lang="ts">
	interface Props {
		label: string;
		value: string;
		type?: 'text' | 'email' | 'password';
		placeholder?: string;
		error?: string;
		/** Renders a multi-line textarea instead of a single-line input. */
		multiline?: boolean;
		rows?: number;
	}

	let {
		label,
		value = $bindable(),
		type = 'text',
		placeholder = '',
		error,
		multiline = false,
		rows = 4
	}: Props = $props();

	// Stable id from the label so the <label for> association works without a prop.
	const id = $derived(`field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

	const inputClasses =
		'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';
</script>

<div>
	<label class="mb-1 block text-sm font-medium text-gray-700" for={id}>{label}</label>
	{#if multiline}
		<textarea {id} bind:value {placeholder} {rows} class={inputClasses}></textarea>
	{:else if type === 'password'}
		<input {id} type="password" bind:value {placeholder} class={inputClasses} />
	{:else if type === 'email'}
		<input {id} type="email" bind:value {placeholder} class={inputClasses} />
	{:else}
		<input {id} type="text" bind:value {placeholder} class={inputClasses} />
	{/if}
	{#if error}
		<p class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
