<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { taskPermission } from '$lib/tasks/permission';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';

	interface Props {
		task: Task;
		currentUserId: number;
		busy?: boolean;
		onSeeMore: () => void;
		onOfferHelp?: () => void;
		onSeeOwner?: () => void;
		onSeeHelper?: () => void;
		onReview?: () => void;
		onMarkDone?: () => void;
		onRemove?: () => void;
		onCancel?: () => void;
		onContact?: () => void;
		onEdit?: () => void;
	}

	let {
		task,
		currentUserId,
		busy = false,
		onSeeMore,
		onOfferHelp,
		onSeeOwner,
		onSeeHelper,
		onReview,
		onMarkDone,
		onRemove,
		onCancel,
		onContact,
		onEdit
	}: Props = $props();

	const permission = $derived(taskPermission(task, currentUserId));
</script>

<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
	<div class="flex flex-col gap-4">
		<div class="flex items-start justify-between gap-4">
			<div class="flex flex-col gap-1">
				<h3 class="text-xl font-semibold text-gray-900">{task.title}</h3>
				<p class="text-sm font-medium text-gray-500">{task.category}</p>
				<p class="text-sm text-gray-600">{task.location.address}</p>
			</div>
			<StatusBadge status={task.status} />
		</div>
		<TaskActionsBar
			{task}
			{permission}
			{busy}
			{onSeeMore}
			{onOfferHelp}
			{onSeeOwner}
			{onSeeHelper}
			{onReview}
			{onMarkDone}
			{onRemove}
			{onCancel}
			{onContact}
			{onEdit}
		/>
	</div>
</div>
