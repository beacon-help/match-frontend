<script lang="ts">
	import config from 'virtual:match-config';
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
	import Inset from '$lib/components/Inset.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

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

<Page>
	{#if taskExists}
		<div class="max-w-2xl">
			<PageHeader title="Your task was created" />
			{#if imageError}
				<p>
					The photos didn't upload, so the task is saved without them. You can try again here, or
					<a
						href={resolve('/tasks/[id]/edit', { id: String(createdTaskId) })}
						class="text-navy underline hover:text-navy-dark">add them later by editing it</a
					>.
				</p>
				<p class="mt-2 text-base text-danger">{imageError}</p>
			{:else}
				<p class="text-ink-soft">Uploading your photos…</p>
			{/if}

			<div class="mt-6">
				<TaskImagePicker bind:pending={pendingImages} disabled={isSubmitting} />
			</div>

			<div class="mt-6 flex flex-wrap gap-3">
				<Button variant="primary" disabled={isSubmitting} onclick={retryUpload}>
					{isSubmitting ? 'Uploading…' : 'Retry upload'}
				</Button>
				<Button disabled={isSubmitting} onclick={skipPhotos}>Continue without photos</Button>
			</div>
		</div>
	{:else}
		<PageHeader
			title="Ask for help"
			lede="Describe one thing you need. You can post as many tasks as you like."
		/>

		<div class="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,38rem)_minmax(0,19rem)]">
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

			<aside>
				<Inset>
					<h2 class="font-bold">What happens next</h2>
					<ol class="mt-2 list-decimal space-y-2 pl-5 text-base text-ink-soft">
						<li>Your task appears on the map for volunteers nearby.</li>
						<li>When someone offers to help, you see their message.</li>
						<li>You decide whether to accept, then agree on the details together.</li>
					</ol>
				</Inset>
				<p class="mt-4 text-base text-ink-soft">
					Need a hand with this form? Write to
					<a href="mailto:{config.contact_email}" class="text-navy underline hover:text-navy-dark"
						>{config.contact_email}</a
					>
				</p>
			</aside>
		</div>
	{/if}
</Page>
