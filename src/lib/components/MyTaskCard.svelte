<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { taskPermission } from '$lib/tasks/permission';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';

	interface Props {
		task: Task;
		currentUserId: number;
		busy?: boolean;
		onSeeMore?: () => void;
		onEdit?: () => void;
		onRemove?: () => void;
		onCancel?: () => void;
		onMarkDone?: () => void;
		onSeeHelper?: () => void;
		onSeeOwner?: () => void;
		onOfferHelp?: () => void;
		onReview?: () => void;
		onContact?: () => void;
	}

	let {
		task,
		currentUserId,
		busy = false,
		onSeeMore,
		onEdit,
		onRemove,
		onCancel,
		onMarkDone,
		onSeeHelper,
		onSeeOwner,
		onOfferHelp,
		onReview,
		onContact
	}: Props = $props();

	const permission = $derived(taskPermission(task, currentUserId));
</script>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<h2 class="text-2xl font-semibold text-gray-900">{task.title}</h2>
			<p class="text-gray-500">{task.description}</p>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<StatusBadge status={task.status} />
			<TaskActionsBar
				{task}
				{permission}
				{busy}
				{onSeeMore}
				{onEdit}
				{onRemove}
				{onCancel}
				{onMarkDone}
				{onSeeHelper}
				{onSeeOwner}
				{onOfferHelp}
				{onReview}
				{onContact}
			/>
		</div>
	</div>
</div>
