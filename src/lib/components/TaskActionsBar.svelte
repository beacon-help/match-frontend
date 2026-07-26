<script lang="ts">
	import type { Task } from '$lib/types/task';
	import type { TaskActionKind } from '$lib/tasks/actions';
	import type { TaskPermission } from '$lib/tasks/permission';
	import { taskActions } from '$lib/tasks/actions';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		task: Task;
		permission: TaskPermission;
		/** Hide the "See more" button (e.g. on the detail page, which is already "more"). */
		hideSeeMore?: boolean;
		/** Disables every button while an action is in flight. */
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
		permission,
		hideSeeMore = false,
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

	const handlers = $derived<Record<TaskActionKind, (() => void) | undefined>>({
		'see-more': onSeeMore,
		edit: onEdit,
		remove: onRemove,
		cancel: onCancel,
		'mark-done': onMarkDone,
		'see-helper': onSeeHelper,
		'see-owner': onSeeOwner,
		'offer-help': onOfferHelp,
		review: onReview,
		contact: onContact
	});

	const specs = $derived(
		taskActions(task.status, permission).filter((s) => !(hideSeeMore && s.kind === 'see-more'))
	);
</script>

<div class="flex flex-wrap items-center gap-4">
	{#each specs as spec (spec.kind)}
		<Button
			variant={spec.variant}
			disabled={busy || !handlers[spec.kind]}
			onclick={handlers[spec.kind]}
		>
			{spec.label}
		</Button>
	{/each}
</div>
