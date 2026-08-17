<script lang="ts">
	import { CATEGORIES } from '$lib/tasks/categories';

	interface Props {
		/** Selected category labels. Bindable so the parent owns the state. */
		selected: string[];
		/**
		 * `filter` (Search): any number may be checked. `select` (Create/Edit): behaves the
		 * same structurally but is labelled for choosing a task's category.
		 */
		mode?: 'filter' | 'select';
	}

	let { selected = $bindable(), mode = 'filter' }: Props = $props();

	function toggle(category: string) {
		if (selected.includes(category)) {
			selected = selected.filter((c) => c !== category);
		} else {
			selected = [...selected, category];
		}
	}
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="mb-1 text-sm font-medium text-gray-700">
		{mode === 'filter' ? 'Filter by category' : 'Category'}
	</legend>
	{#each CATEGORIES as category (category)}
		<label class="flex items-center gap-2 text-sm text-gray-700">
			<input
				type="checkbox"
				checked={selected.includes(category)}
				onchange={() => toggle(category)}
				class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
			/>
			{category}
		</label>
	{/each}
</fieldset>
