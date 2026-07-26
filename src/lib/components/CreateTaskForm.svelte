<script lang="ts">
	import type { TaskCreationRequest, TaskStatus } from '$lib/types/task';
	import type { TaskErrors } from '$lib/validation/task';
	import { CATEGORIES } from '$lib/tasks/categories';
	import TextField from '$lib/components/TextField.svelte';
	import AddressFinder from '$lib/components/AddressFinder.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		task: TaskCreationRequest;
		errors?: TaskErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		mode?: 'create' | 'edit';
		/** Shown as a header badge in edit mode. */
		status?: TaskStatus;
		onSubmit: (event: SubmitEvent) => void;
		onCancel: () => void;
	}

	let {
		task = $bindable(),
		errors = {},
		isSubmitting = false,
		submitError = null,
		mode = 'create',
		status,
		onSubmit,
		onCancel
	}: Props = $props();
</script>

<div class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<div class="mb-4 flex items-center justify-between gap-4">
		<h2 class="text-2xl font-bold text-gray-800">
			{mode === 'edit' ? 'Edit your Task' : 'Add a new Task'}
		</h2>
		{#if mode === 'edit' && status}
			<StatusBadge {status} />
		{/if}
	</div>

	<form class="space-y-4" onsubmit={onSubmit}>
		{#if submitError}
			<div class="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
				{submitError}
			</div>
		{/if}

		<TextField
			label="Title"
			bind:value={task.title}
			placeholder="e.g. Help moving furniture"
			error={errors.title}
		/>

		<TextField
			label="Describe your situation"
			bind:value={task.description}
			multiline
			rows={5}
			placeholder="Explain what you need help with…"
			error={errors.description}
		/>

		<div class="flex flex-col gap-1">
			<label class="text-sm font-medium text-gray-700" for="category-select">Category</label>
			<select
				id="category-select"
				bind:value={task.category}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			>
				<option value="" disabled>Select a category…</option>
				{#each CATEGORIES as category (category)}
					<option value={category}>{category}</option>
				{/each}
			</select>
			{#if errors.category}
				<p class="text-sm text-red-600">{errors.category}</p>
			{/if}
		</div>

		<AddressFinder
			bind:address={task.location.address}
			bind:lat={task.location.lat}
			bind:lon={task.location.lon}
			error={errors.location}
		/>

		<div class="flex justify-end gap-3">
			<Button variant="neutral" onclick={onCancel}>Cancel</Button>
			<button
				type="submit"
				disabled={isSubmitting}
				class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create task'}
			</button>
		</div>
	</form>
</div>
