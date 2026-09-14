<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask, updateTask } from '$lib/api/task';
	import { applyImageChanges } from '$lib/tasks/applyImageChanges';
	import { getAccessToken } from '$lib/auth/tokens';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import { describeApiError } from '$lib/api/client';
	import { validateTask, type TaskErrors } from '$lib/validation/task';
	import type { TaskCreationRequest } from '$lib/types/task';
	import CreateTaskForm from '$lib/components/CreateTaskForm.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';

	const taskId = Number(page.params.id);

	let form = $state<TaskCreationRequest>({
		title: '',
		description: '',
		category: '',
		location: { address: '', lat: NaN, lon: NaN }
	});
	let pendingImages: File[] = $state([]);
	let removedImageIds: string[] = $state([]);
	let errors: TaskErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);

	// The loader seeds `form` as a side effect: it is bound into the form and edited from
	// there, so it cannot be derived from the loaded task without discarding those edits.
	const authed = createAuthedPage(async (token) => {
		const task = await getTask(taskId, token);
		form = {
			title: task.title,
			description: task.description,
			category: task.category,
			location: { ...task.location }
		};
		return task;
	});

	const original = $derived(authed.data ?? null);

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
			authed.data = outcome.task;
		}
		removedImageIds = outcome.remaining.removedIds;
		pendingImages = outcome.remaining.added;

		return outcome.error === null ? null : `Your details were saved, but ${outcome.error}`;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		// Read at submit time rather than caching from the load: the stored token can be
		// replaced while the form is open.
		const token = getAccessToken();
		if (!original || !token) return;

		errors = validateTask(form);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			const failure = await saveChanges(token);
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

	{#if authed.isLoading}
		<p class="text-gray-600">Loading task…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to edit this task" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
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
