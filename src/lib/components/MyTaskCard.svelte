<script lang="ts">
	import type { Task, TaskStatus } from '$lib/types/task';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		task: Task;
		onRemove: () => void;
		onMarkDone: () => void;
	}

	let { task, onRemove, onMarkDone }: Props = $props();

	const statusBadge: Record<TaskStatus, { label: string; classes: string }> = {
		open: { label: 'OPEN', classes: 'bg-green-100 border-green-300 text-green-800' },
		pending: { label: 'PENDING', classes: 'bg-gray-100 border-gray-300 text-gray-800' },
		approved: { label: 'IN PROGRESS', classes: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
		succeeded: { label: 'SUCCEEDED', classes: 'bg-blue-100 border-blue-300 text-blue-800' },
		failed: { label: 'CLOSED', classes: 'bg-red-100 border-red-300 text-red-800' },
		cancelled: { label: 'CLOSED', classes: 'bg-red-100 border-red-300 text-red-800' }
	};

	type ActionButton = { label: string; disabled: boolean; onclick?: () => void };

	function actionsForStatus(status: TaskStatus): ActionButton[] {
		switch (status) {
			case 'open':
				return [
					{ label: 'See more', disabled: true },
					{ label: 'Edit', disabled: true },
					{ label: 'Remove', disabled: false, onclick: onRemove }
				];
			case 'pending':
				return [
					{ label: 'See more', disabled: true },
					{ label: 'Remove', disabled: false, onclick: onRemove }
				];
			case 'approved':
				return [
					{ label: 'Mark done', disabled: false, onclick: onMarkDone },
					{ label: 'See more', disabled: true },
					{ label: 'See Helper', disabled: true },
					{ label: 'Remove', disabled: false, onclick: onRemove }
				];
			case 'succeeded':
			case 'failed':
			case 'cancelled':
				return [
					{ label: 'See more', disabled: true },
					{ label: 'See Helper', disabled: true }
				];
		}
	}

	const badge = $derived(statusBadge[task.status]);
	const actions = $derived(actionsForStatus(task.status));
</script>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<h2 class="text-2xl font-semibold text-gray-900">{task.title}</h2>
			<p class="text-gray-500">{task.description}</p>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<span class={`rounded-lg border px-3 py-2 text-sm font-medium ${badge.classes}`}>
				{badge.label}
			</span>
			<div class="flex flex-wrap items-center gap-4">
				{#each actions as action (action.label)}
					<Button variant="neutral" disabled={action.disabled} onclick={action.onclick}>
						{action.label}
					</Button>
				{/each}
			</div>
		</div>
	</div>
</div>
