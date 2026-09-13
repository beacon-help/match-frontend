<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { addTaskImages, createTask } from '$lib/api/task';
	import { getAccessToken } from '$lib/auth/tokens';
	import { describeApiError } from '$lib/api/client';
	import { validateTask, type TaskErrors } from '$lib/validation/task';
	import type { TaskCreationRequest } from '$lib/types/task';
	import CreateTaskForm from '$lib/components/CreateTaskForm.svelte';
	import TaskImagePicker from '$lib/components/TaskImagePicker.svelte';
	import Button from '$lib/components/Button.svelte';

	let task: TaskCreationRequest = $state({
		title: '',
		description: '',
		category: '',
		location: { address: '', lat: NaN, lon: NaN }
	});
	let pendingImages: File[] = $state([]);
	let errors: TaskErrors = $state({});
	let isSubmitting = $state(false);
	let submitError: string | null = $state(null);

	// Photos can only be uploaded once the task exists, so a failure here leaves a real task
	// behind. Remembering its id keeps a retry from creating a second one.
	let createdTaskId: number | null = $state(null);
	let imageError: string | null = $state(null);
	// Latched on the id, not on the error: a navigation that resolves without actually
	// leaving must not drop the user back onto a form whose task already exists.
	const taskExists = $derived(createdTaskId !== null);

	async function uploadThenLeave(taskId: number, token: string) {
		try {
			if (pendingImages.length > 0) {
				await addTaskImages(taskId, pendingImages, token);
				pendingImages = [];
			}
			imageError = null;
			await goto(resolve('/tasks'));
		} catch (err) {
			imageError = describeApiError(err);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const token = getAccessToken();
		if (!token) {
			submitError = 'You need to sign in to create a task.';
			return;
		}

		// An earlier submit may have created the task and only failed on the photos; posting
		// again would leave a duplicate behind.
		if (createdTaskId !== null) {
			isSubmitting = true;
			await uploadThenLeave(createdTaskId, token);
			return;
		}

		errors = validateTask(task);
		if (Object.keys(errors).length > 0) {
			return;
		}

		isSubmitting = true;
		submitError = null;
		try {
			const created = await createTask(task, token);
			createdTaskId = created.id;
		} catch (err) {
			submitError = describeApiError(err);
			isSubmitting = false;
			return;
		}

		await uploadThenLeave(createdTaskId, token);
	}

	async function retryUpload() {
		if (createdTaskId === null) return;

		const token = getAccessToken();
		if (!token) {
			imageError = 'You need to sign in to upload photos.';
			return;
		}

		isSubmitting = true;
		await uploadThenLeave(createdTaskId, token);
	}

	async function skipPhotos() {
		await goto(resolve('/tasks'));
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Create Task</h3>

	{#if taskExists}
		<div class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
			<h2 class="text-2xl font-bold text-gray-800">Your task was created</h2>
			{#if imageError}
				<p class="mt-2 text-gray-700">
					The photos didn't upload, so the task is saved without them. You can try again here, or
					<a
						href={resolve('/tasks/[id]/edit', { id: String(createdTaskId) })}
						class="font-medium text-blue-600 hover:text-blue-700">add them later by editing it</a
					>.
				</p>
				<p class="mt-2 text-sm text-red-600">{imageError}</p>
			{:else}
				<p class="mt-2 text-gray-700">Uploading your photos…</p>
			{/if}

			<div class="mt-4">
				<TaskImagePicker bind:pending={pendingImages} disabled={isSubmitting} />
			</div>

			<div class="mt-6 flex justify-end gap-3">
				<Button variant="neutral" disabled={isSubmitting} onclick={skipPhotos}>
					Continue without photos
				</Button>
				<Button variant="primary" disabled={isSubmitting} onclick={retryUpload}>
					{isSubmitting ? 'Uploading…' : 'Retry upload'}
				</Button>
			</div>
		</div>
	{:else}
		<CreateTaskForm
			bind:task
			bind:pendingImages
			{errors}
			{isSubmitting}
			{submitError}
			mode="create"
			onSubmit={handleSubmit}
			onCancel={() => goto(resolve('/tasks'))}
		/>
	{/if}
</section>
