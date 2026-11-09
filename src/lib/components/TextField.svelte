<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import PasswordInput from '$lib/components/PasswordInput.svelte';

	interface Props {
		label: string;
		value: string;
		type?: 'text' | 'email' | 'password';
		placeholder?: string;
		/** Help text shown under the field. */
		hint?: string;
		error?: string;
		readonly?: boolean;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		/** Password fields only: offer a Show/Hide toggle. */
		revealable?: boolean;
		/** Password fields only: whether the password shows as plain text. */
		visible?: boolean;
		/** Renders a multi-line textarea instead of a single-line input. */
		multiline?: boolean;
		rows?: number;
	}

	let {
		label,
		value = $bindable(),
		type = 'text',
		placeholder = '',
		hint,
		error,
		readonly = false,
		autocomplete,
		revealable = true,
		visible = $bindable(true),
		multiline = false,
		rows = 4
	}: Props = $props();

	// Stable id from the label so the <label for> association works without a prop.
	const id = $derived(`field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
	const hintId = $derived(`${id}-hint`);
	const errorId = $derived(`${id}-error`);

	const invalid = $derived(error ? true : undefined);
	const describedBy = $derived(
		[hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
	);

	const inputClasses =
		'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 read-only:bg-gray-50 read-only:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';
</script>

<div>
	<label class="mb-1 block text-sm font-medium text-gray-700" for={id}>{label}</label>
	{#if multiline}
		<textarea
			{id}
			bind:value
			{placeholder}
			{rows}
			aria-invalid={invalid}
			aria-describedby={describedBy}
			class={inputClasses}></textarea>
	{:else if type === 'password' && revealable}
		<PasswordInput
			{id}
			bind:value
			bind:visible
			{placeholder}
			{autocomplete}
			aria-invalid={invalid}
			aria-describedby={describedBy}
		/>
	{:else}
		<input
			{id}
			{type}
			bind:value
			{placeholder}
			{readonly}
			{autocomplete}
			aria-invalid={invalid}
			aria-describedby={describedBy}
			class={inputClasses}
		/>
	{/if}
	{#if hint}
		<p id={hintId} class="mt-1 text-sm text-gray-500">{hint}</p>
	{/if}
	{#if error}
		<p id={errorId} class="mt-1 text-sm text-red-600">{error}</p>
	{/if}
</div>
