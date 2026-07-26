<script lang="ts">
	import type { Task } from '$lib/types/task';
	import Modal from '$lib/components/Modal.svelte';
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		task: Task;
		isSubmitting?: boolean;
		error?: string | null;
		onClose: () => void;
		/** Called with the volunteer's message; the parent performs the join + mock-persist. */
		onSubmit: (message: string) => void;
	}

	let { task, isSubmitting = false, error = null, onClose, onSubmit }: Props = $props();

	let message = $state('');
</script>

<Modal title="Offer help" {onClose}>
	<p class="mb-4 text-sm text-gray-600">
		Send a message to the person who posted <span class="font-medium">{task.title}</span>.
	</p>

	<form
		class="space-y-4"
		onsubmit={(e) => {
			e.preventDefault();
			onSubmit(message);
		}}
	>
		<TextField
			label="Your message"
			bind:value={message}
			multiline
			placeholder="Introduce yourself and how you can help…"
		/>

		{#if error}
			<p class="text-sm text-red-600">{error}</p>
		{/if}

		<div class="flex justify-end gap-3">
			<Button variant="neutral" onclick={onClose}>Cancel</Button>
			<Button variant="primary" disabled={isSubmitting} onclick={() => onSubmit(message)}>
				{isSubmitting ? 'Sending…' : 'Send'}
			</Button>
		</div>
	</form>
</Modal>
