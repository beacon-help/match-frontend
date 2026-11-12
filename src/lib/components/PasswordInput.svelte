<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

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
		class="w-full rounded-lg border border-gray-300 py-2 pr-16 pl-4 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
	/>
	<button
		type="button"
		onclick={toggleVisible}
		aria-pressed={visible}
		aria-controls={id}
		class="absolute inset-y-0 right-0 px-3 text-sm font-medium text-blue-600 hover:text-blue-700"
	>
		{visible ? 'Hide' : 'Show'}
	</button>
</div>
