<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Task } from '$lib/types/task';
	import { taskPermission } from '$lib/tasks/permission';
	import { categoryLabel } from '$lib/tasks/categories';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';

	interface Props {
		task: Task;
		currentUserId: number;
		busy?: boolean;
		onOfferHelp?: () => void;
		onSeeOwner?: () => void;
		onSeeHelper?: () => void;
		onReview?: () => void;
		onMarkDone?: () => void;
		onRemove?: () => void;
		onCancel?: () => void;
		onEdit?: () => void;
	}

	let {
		task,
		currentUserId,
		busy = false,
		onOfferHelp,
		onSeeOwner,
		onSeeHelper,
		onReview,
		onMarkDone,
		onRemove,
		onCancel,
		onEdit
	}: Props = $props();

	const permission = $derived(taskPermission(task, currentUserId));
	const href = $derived(resolve('/tasks/[id]', { id: String(task.id) }));
</script>

<li
	class="grid items-center gap-x-6 gap-y-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
>
	<div>
		<h3 class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl leading-snug font-semibold">
			<a {href} class="-my-2 py-2 text-navy underline hover:text-navy-dark">{task.title}</a>
			<StatusBadge status={task.status} {permission} />
		</h3>
		<p class="mt-1 text-base text-ink-soft">
			{categoryLabel(task.category)} · {task.location.address}
		</p>
	</div>
	<TaskActionsBar
		{task}
		{permission}
		omit={['see-more']}
		{busy}
		{onOfferHelp}
		{onSeeOwner}
		{onSeeHelper}
		{onReview}
		{onMarkDone}
		{onRemove}
		{onCancel}
		{onEdit}
	/>
</li>
