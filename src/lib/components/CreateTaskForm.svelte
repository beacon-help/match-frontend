<script lang="ts">
	import type { TaskCreationRequest, TaskImage } from '$lib/types/task';
	import type { TaskErrors } from '$lib/validation/task';
	import { CATEGORIES } from '$lib/tasks/categories';
	import TextField from '$lib/components/TextField.svelte';
	import AddressFinder from '$lib/components/AddressFinder.svelte';
	import Button from '$lib/components/Button.svelte';
	import TaskImagePicker from '$lib/components/TaskImagePicker.svelte';
	import Inset from '$lib/components/Inset.svelte';
	import { INPUT_CLASSES } from '$lib/forms/inputClasses';

	interface Props {
		task: TaskCreationRequest;
		errors?: TaskErrors;
		isSubmitting?: boolean;
		submitError?: string | null;
		mode?: 'create' | 'edit';
		/** Photos already stored on the task, in edit mode. */
		existingImages?: TaskImage[];
		/** Newly picked photos, uploaded by the parent once the task exists. */
		pendingImages?: File[];
		/** Ids of existing photos to delete when the parent saves. */
		removedImageIds?: string[];
		onSubmit: (event: SubmitEvent) => void;
		onCancel: () => void;
	}

	let {
		task = $bindable(),
		errors = {},
		isSubmitting = false,
		submitError = null,
		mode = 'create',
		existingImages = [],
		pendingImages = $bindable([]),
		removedImageIds = $bindable([]),
		onSubmit,
		onCancel
	}: Props = $props();

	const submitLabel = $derived(
		isSubmitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create task'
	);
</script>

<form class="space-y-6" onsubmit={onSubmit}>
	{#if submitError}
		<Inset tone="error">{submitError}</Inset>
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
		hint="A few sentences is enough. Mention anything a volunteer should bring."
		error={errors.description}
	/>

	<div class={errors.category ? 'border-l-4 border-danger pl-3.5' : undefined}>
		<label class="mb-1 block font-semibold" for="category-select">Category</label>
		{#if errors.category}
			<p class="mb-1.5 text-base font-semibold text-danger">{errors.category}</p>
		{/if}
		<select
			id="category-select"
			bind:value={task.category}
			aria-invalid={errors.category ? true : undefined}
			class={[INPUT_CLASSES, 'px-3']}
		>
			<option value="" disabled>Select a category…</option>
			{#each CATEGORIES as category (category.value)}
				<option value={category.value}>{category.label}</option>
			{/each}
		</select>
	</div>

	<AddressFinder
		bind:address={task.location.address}
		bind:lat={task.location.lat}
		bind:lon={task.location.lon}
		error={errors.location}
	/>

	<TaskImagePicker
		existing={existingImages}
		bind:pending={pendingImages}
		bind:removedIds={removedImageIds}
		disabled={isSubmitting}
	/>

	<div class="flex flex-wrap items-center gap-3 pt-2">
		<Button variant="primary" type="submit" disabled={isSubmitting}>{submitLabel}</Button>
		<Button variant="link" onclick={onCancel}>Cancel</Button>
	</div>
</form>
