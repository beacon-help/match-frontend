<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { INPUT_CLASSES } from '$lib/forms/inputClasses';

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

	const inputClasses = `${INPUT_CLASSES} px-3 read-only:bg-fill read-only:text-ink-soft`;
</script>

<div class={error ? 'border-l-4 border-danger pl-3.5' : undefined}>
	<label class="mb-1 block font-semibold" for={id}>{label}</label>
	{#if hint}
		<p id={hintId} class="mb-1.5 text-base text-ink-soft">{hint}</p>
	{/if}
	{#if error}
		<p id={errorId} class="mb-1.5 text-base font-semibold text-danger">{error}</p>
	{/if}
	{#if multiline}
		<textarea
			{id}
			bind:value
			{placeholder}
			{rows}
			aria-invalid={invalid}
			aria-describedby={describedBy}
			class={inputClasses}></textarea>
	{:else if type === 'password'}
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
</div>
