<script lang="ts">
	import type { Task } from '$lib/types/task';
	import Modal from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';

	interface Props {
		task: Task;
		/** The volunteer's offer message (null if this offer had none). */
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
	<p class="mb-3 text-ink-soft">
		<span class="font-semibold text-ink">{helperName}</span> offered to help with
		<span class="font-semibold text-ink">{task.title}</span>.
	</p>

	<Inset>{message ?? 'No message was provided.'}</Inset>

	<!-- TODO: backend — phone numbers are not exposed by the API. -->
	<p class="mt-3 mb-5 text-base text-ink-soft">
		If you accept, you'll be able to share contact details to coordinate.
	</p>

	{#if error}
		<p class="mb-3 text-base text-danger">{error}</p>
	{/if}

	<div class="flex flex-wrap gap-3">
		<Button variant="primary" disabled={isSubmitting} onclick={onAccept}>
			{isSubmitting ? 'Working…' : 'Accept'}
		</Button>
		<Button variant="neutral" disabled={isSubmitting} onclick={onReject}>Reject</Button>
	</div>
</Modal>
