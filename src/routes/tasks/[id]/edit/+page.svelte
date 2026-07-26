<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask, updateTask } from '$lib/api/task';
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
	let errors: TaskErrors = $state({});
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let loadError: string | null = $state(null);
	let submitError: string | null = $state(null);
	let needsSignIn = $state(false);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!original) return;

		errors = validateTask(form);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			// TODO: backend — no field-update endpoint yet; updateTask mock-resolves locally.
			await updateTask(original, form);
			await goto(resolve('/tasks/[id]', { id: String(taskId) }));
		} catch (err) {
			submitError = describeApiError(err);
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
