<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask, updateTask } from '$lib/api/task';
	import { applyImageChanges } from '$lib/tasks/applyImageChanges';
	import { getAccessToken } from '$lib/auth/tokens';
	import { ApiError, describeApiError } from '$lib/api/client';
	import { validateTask, type TaskErrors } from '$lib/validation/task';
	import type { Task, TaskCreationRequest } from '$lib/types/task';
	import CreateTaskForm from '$lib/components/CreateTaskForm.svelte';

	const taskId = Number(page.params.id);

	let original = $state<Task | null>(null);
	let form = $state<TaskCreationRequest>({
		title: '',
		description: '',
		category: '',
		location: { address: '', lat: NaN, lon: NaN }
	});
	let pendingImages: File[] = $state([]);
	let removedImageIds: string[] = $state([]);
	let errors: TaskErrors = $state({});
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let loadError: string | null = $state(null);
	let submitError: string | null = $state(null);
	let needsSignIn = $state(false);
	let accessToken = $state<string | null>(null);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

		accessToken = token;
		try {
			const task = await getTask(taskId, token);
			original = task;
			form = {
				title: task.title,
				description: task.description,
				category: task.category,
				location: { ...task.location }
			};
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				needsSignIn = true;
			} else {
				loadError = describeApiError(err);
			}
		} finally {
			isLoading = false;
		}
	});

	/**
	 * Saves the details, then the photo changes — the backend exposes them as separate
	 * calls, so the sequence is batched rather than atomic and the copy has to say how far
	 * it got.
	 *
	 * @returns a user-facing message, or null if everything saved.
	 */
	async function saveChanges(token: string): Promise<string | null> {
		try {
			await updateTask(taskId, form, token);
		} catch (err) {
			return describeApiError(err);
		}

		const outcome = await applyImageChanges(
			taskId,
			{ removedIds: removedImageIds, added: pendingImages },
			token
		);

		// Adopting the server's copy keeps the picker honest about what survived, and the
		// remaining queues mean a retry only repeats what is genuinely outstanding.
		if (outcome.task) {
			original = outcome.task;
		}
		removedImageIds = outcome.remaining.removedIds;
		pendingImages = outcome.remaining.added;

		return outcome.error === null ? null : `Your details were saved, but ${outcome.error}`;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!original || !accessToken) return;

		errors = validateTask(form);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			const failure = await saveChanges(accessToken);
			if (failure) {
				submitError = failure;
				return;
			}
			await goto(resolve('/tasks/[id]', { id: String(taskId) }));
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Edit Task</h3>

	{#if isLoading}
		<p class="text-gray-600">Loading task…</p>
	{:else if needsSignIn}
		<p class="text-gray-600">
			You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
				>sign in</a
			> to edit this task.
		</p>
	{:else if loadError}
		<p class="text-red-600">{loadError}</p>
	{:else if original}
		<CreateTaskForm
			bind:task={form}
			bind:pendingImages
			bind:removedImageIds
			existingImages={original.images}
			{errors}
			{isSubmitting}
			{submitError}
			mode="edit"
			status={original.status}
			onSubmit={handleSubmit}
			onCancel={() => goto(resolve('/tasks/[id]', { id: String(taskId) }))}
		/>
	{/if}
</section>
