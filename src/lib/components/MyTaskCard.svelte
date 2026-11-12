<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Task } from '$lib/types/task';
	import { taskPermission } from '$lib/tasks/permission';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';

	interface Props {
		task: Task;
		currentUserId: number;
		busy?: boolean;
		onEdit?: () => void;
		onRemove?: () => void;
		onCancel?: () => void;
		onMarkDone?: () => void;
		onSeeHelper?: () => void;
		onSeeOwner?: () => void;
		onOfferHelp?: () => void;
		onReview?: () => void;
	}

	let {
		task,
		currentUserId,
		busy = false,
		onEdit,
		onRemove,
		onCancel,
		onMarkDone,
		onSeeHelper,
		onSeeOwner,
		onOfferHelp,
		onReview
	}: Props = $props();

	const permission = $derived(taskPermission(task, currentUserId));
	const href = $derived(resolve('/tasks/[id]', { id: String(task.id) }));
</script>

<li
	class="grid items-start gap-x-6 gap-y-2.5 border-b border-line py-4.5 lg:grid-cols-[minmax(0,1fr)_9.5rem_20rem]"
>
	<div>
		<h2 class="text-xl leading-snug font-semibold">
			<a {href} class="-my-2 inline-block py-2 text-navy underline hover:text-navy-dark"
				>{task.title}</a
			>
		</h2>
		<p class="mt-0.5 line-clamp-2 max-w-[52ch] text-base text-ink-soft">{task.description}</p>
	</div>
	<div class="lg:pt-0.5">
		<StatusBadge status={task.status} {permission} />
	</div>
	<div class="flex lg:justify-end">
		<TaskActionsBar
			{task}
			{permission}
			omit={['see-more']}
			{busy}
			{onEdit}
			{onRemove}
			{onCancel}
			{onMarkDone}
			{onSeeHelper}
			{onSeeOwner}
			{onOfferHelp}
			{onReview}
		/>
	</div>
</li>
