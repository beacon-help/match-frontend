<script lang="ts">
	import { CATEGORIES } from '$lib/tasks/categories';
	import CheckboxOption from '$lib/components/CheckboxOption.svelte';

	interface Props {
		/** Selected category values. Bindable so the parent owns the state. */
		selected: string[];
	}

	let { selected = $bindable() }: Props = $props();

	function toggle(category: string) {
		if (selected.includes(category)) {
			selected = selected.filter((c) => c !== category);
		} else {
			selected = [...selected, category];
		}
	}
</script>

<fieldset>
	<legend class="mb-1.5 font-semibold">Kind of help</legend>
	{#each CATEGORIES as category (category.value)}
		<CheckboxOption
			label={category.label}
			checked={selected.includes(category.value)}
			onchange={() => toggle(category.value)}
		/>
	{/each}
</fieldset>
