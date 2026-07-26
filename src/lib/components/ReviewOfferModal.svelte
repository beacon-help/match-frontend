<script lang="ts">
	import type { Task } from '$lib/types/task';
	import Modal from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		task: Task;
		/** The volunteer's mock-persisted offer message (null if none was stored). */
		message: string | null;
		isSubmitting?: boolean;
		error?: string | null;
		onClose: () => void;
		onAccept: () => void;
		onReject: () => void;
	}

	let {
		task,
		message,
		isSubmitting = false,
		error = null,
		onClose,
		onAccept,
		onReject
	}: Props = $props();

	const helperName = $derived(task.helper?.first_name ?? 'A volunteer');
</script>

<Modal title="Review request" {onClose}>
	<p class="mb-2 text-sm text-gray-600">
		<span class="font-medium">{helperName}</span> offered to help with
		<span class="font-medium">{task.title}</span>.
	</p>

	<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
		{message ?? 'No message was provided.'}
	</div>

	<!-- TODO: backend — phone numbers are not exposed by the API. -->
	<p class="mb-4 text-xs text-gray-500">
		If you accept, you'll be able to share contact details to coordinate.
	</p>

	{#if error}
		<p class="mb-3 text-sm text-red-600">{error}</p>
	{/if}

	<div class="flex justify-end gap-3">
		<Button variant="neutral" disabled={isSubmitting} onclick={onReject}>Reject</Button>
		<Button variant="primary" disabled={isSubmitting} onclick={onAccept}>
			{isSubmitting ? 'Working…' : 'Accept'}
		</Button>
	</div>
</Modal>
