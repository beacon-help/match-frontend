<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createTask } from '$lib/api/task';
	import { getAccessToken } from '$lib/auth/tokens';
	import { describeApiError } from '$lib/api/client';
	import { validateTask, type TaskErrors } from '$lib/validation/task';
	import type { TaskCreationRequest } from '$lib/types/task';
	import CreateTaskForm from '$lib/components/CreateTaskForm.svelte';

	let task: TaskCreationRequest = $state({
		title: '',
		description: '',
		category: '',
		location: { address: '', lat: NaN, lon: NaN }
	});
	let errors: TaskErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		errors = validateTask(task);
		if (Object.keys(errors).length > 0) {
			return;
		}

		const token = getAccessToken();
		if (!token) {
			submitError = 'You need to sign in to create a task.';
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			await createTask(task, token);
			await goto(resolve('/tasks'));
		} catch (err) {
			submitError = describeApiError(err);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Create Task</h3>

	<CreateTaskForm
		bind:task
		{errors}
		{isSubmitting}
		{submitError}
		mode="create"
		onSubmit={handleSubmit}
		onCancel={() => goto(resolve('/tasks'))}
	/>
</section>
