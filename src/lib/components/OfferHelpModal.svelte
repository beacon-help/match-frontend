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
		/** Called with the volunteer's message; the parent submits it as the join's helper_offer. */
		onSubmit: (message: string) => void;
	}

	let { task, isSubmitting = false, error = null, onClose, onSubmit }: Props = $props();

	let message = $state('');
</script>

<Modal title="Offer help" {onClose}>
	<p class="mb-4 text-ink-soft">
		Send a message to the person who posted <span class="font-semibold text-ink">{task.title}</span
		>.
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
			<p class="text-base text-danger">{error}</p>
		{/if}

		<div class="flex flex-wrap items-center gap-3">
			<Button variant="primary" disabled={isSubmitting} onclick={() => onSubmit(message)}>
				{isSubmitting ? 'Sending…' : 'Send offer'}
			</Button>
			<Button variant="link" onclick={onClose}>Cancel</Button>
		</div>
	</form>
</Modal>
