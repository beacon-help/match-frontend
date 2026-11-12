<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { INPUT_CLASSES } from '$lib/forms/inputClasses';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'value' | 'class'> {
		id: string;
		value: string;
		placeholder?: string;
		/** Whether the password shows as plain text. Starts as given; bind it to reset it. */
		visible?: boolean;
	}

	let {
		id,
		value = $bindable(),
		placeholder = '',
		visible = $bindable(true),
		...attributes
	}: Props = $props();

	function toggleVisible() {
		visible = !visible;
	}
</script>

<div class="relative">
	<input
		{...attributes}
		{id}
		type={visible ? 'text' : 'password'}
		bind:value
		{placeholder}
		class={[INPUT_CLASSES, 'pr-16 pl-3']}
	/>
	<button
		type="button"
		onclick={toggleVisible}
		aria-pressed={visible}
		aria-controls={id}
		class="absolute inset-y-0 right-0 px-3 text-base text-navy underline hover:text-navy-dark"
	>
		{visible ? 'Hide' : 'Show'}
	</button>
</div>
