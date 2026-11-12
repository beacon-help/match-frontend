<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask } from '$lib/api/task';
	import { taskPermission } from '$lib/tasks/permission';
	import { nextStep } from '$lib/tasks/nextStep';
	import type { TaskActionKind } from '$lib/tasks/actions';
	import { categoryLabel } from '$lib/tasks/categories';
	import { helperOfferMessage } from '$lib/tasks/offers';
	import { imageSrc } from '$lib/tasks/images';
	import { createTaskActionRunner } from '$lib/tasks/actionRunner.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import { session } from '$lib/auth/session.svelte';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';
	import TaskActivity from '$lib/components/TaskActivity.svelte';
	import OfferHelpModal from '$lib/components/OfferHelpModal.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import TaskNextStep from '$lib/components/TaskNextStep.svelte';
	import SummaryRow from '$lib/components/SummaryRow.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	const taskId = Number(page.params.id);

	let showOffer = $state(false);
	let showReview = $state(false);
	let profileUserId: number | null = $state(null);
	let actionError: string | null = $state(null);

	const authed = createAuthedPage((token) => getTask(taskId, token));

	const task = $derived(authed.data ?? null);
	const currentUserId = $derived(session.user?.id ?? 0);

	const actions = createTaskActionRunner((updated) => {
		authed.data = updated;
	});

	const permission = $derived(task ? taskPermission(task, currentUserId) : 'public');
	const markers = $derived(
		task
			? [
					{ lat: Number(task.location.lat), lon: Number(task.location.lon), label: task.title }
				].filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon))
			: []
	);
	const postedAt = $derived(
		task ? new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''
	);

	const facts = $derived(
		task
			? [
					{ label: 'Category', value: categoryLabel(task.category) },
					{ label: 'Location', value: task.location.address },
					{ label: 'Posted', value: postedAt },
					{ label: 'Owner', value: task.owner.first_name }
				]
			: []
	);
	const back = $derived(
		permission === 'public'
			? { href: resolve('/tasks/search'), label: 'Back to task search' }
			: { href: resolve('/tasks'), label: 'Back to my tasks' }
	);

	const step = $derived(task ? nextStep(task, permission) : null);
	const stepHandlers: Partial<Record<TaskActionKind, () => void>> = {
		review: openReview,
		'offer-help': openOffer,
		'mark-done': () => runAction('report_success')
	};
	const onStepAction = $derived(step?.action ? stepHandlers[step.action] : undefined);
	const omittedActions = $derived<TaskActionKind[]>(
		step?.action ? ['see-more', step.action] : ['see-more']
	);

	function openOffer() {
		actionError = null;
		showOffer = true;
	}

	function openReview() {
		actionError = null;
		showReview = true;
	}

	function runAction(action: 'close' | 'report_success') {
		if (!task) return;
		return actions.runAction(task, action, (msg) => (authed.error = msg));
	}

	async function submitOffer(message: string) {
		if (!task) return;
		const updated = await actions.submitOffer(task, message, (msg) => (actionError = msg));
		if (updated) showOffer = false;
	}

	async function reviewDecision(action: 'approve' | 'reject') {
		if (!task) return;
		const updated = await actions.reviewDecision(task, action, (msg) => (actionError = msg));
		if (updated) showReview = false;
	}
</script>

<Page>
	{#if authed.isLoading}
		<p class="text-ink-soft">Loading task…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view this task" />
	{:else if authed.error}
		<p class="text-danger">{authed.error}</p>
	{:else if task}
		<a
			href={back.href}
			class="mb-1 inline-flex min-h-11 items-center text-base text-navy underline hover:text-navy-dark"
		>
			‹ {back.label}
		</a>
		<PageHeader title={task.title}>
			{#snippet badge()}
				<StatusBadge status={task.status} {permission} />
			{/snippet}
		</PageHeader>

		<div class="grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<article class="min-w-0 space-y-5 sm:space-y-7">
				{#if step}
					<TaskNextStep {step} busy={actions.busy} onAction={onStepAction} />
				{/if}

				<p>{task.description}</p>

				{#if task.images.length > 0}
					<div class="grid grid-cols-3 gap-2.5">
						{#each task.images as image, i (image.id)}
							<img
								src={imageSrc(image.path)}
								alt="Task photo {i + 1}"
								class="aspect-[3/2] w-full object-cover"
							/>
						{/each}
					</div>
				{/if}

				<dl class="border-t border-line">
					{#each facts as fact (fact.label)}
						<SummaryRow label={fact.label}>{fact.value}</SummaryRow>
					{/each}
				</dl>

				<HomeMap {markers} short />

				{#if actionError}
					<p class="text-base text-danger">{actionError}</p>
				{/if}

				<TaskActionsBar
					{task}
					{permission}
					omit={omittedActions}
					busy={actions.busy}
					onOfferHelp={openOffer}
					onReview={openReview}
					onSeeOwner={() => task && (profileUserId = task.owner.id)}
					onSeeHelper={() => task?.helper && (profileUserId = task.helper.id)}
					onMarkDone={() => runAction('report_success')}
					onRemove={() => runAction('close')}
					onCancel={() => runAction('close')}
					onEdit={() => goto(resolve('/tasks/[id]/edit', { id: String(taskId) }))}
				/>
			</article>

			<TaskActivity events={task.events} ownerId={task.owner.id} viewerId={currentUserId} />
		</div>
	{/if}
</Page>

{#if showOffer && task}
	<OfferHelpModal
		{task}
		isSubmitting={actions.busy}
		error={actionError}
		onClose={() => (showOffer = false)}
		onSubmit={submitOffer}
	/>
{/if}

{#if showReview && task}
	<ReviewOfferModal
		{task}
		message={helperOfferMessage(task, task.helper?.id)}
		isSubmitting={actions.busy}
		error={actionError}
		onClose={() => (showReview = false)}
		onAccept={() => reviewDecision('approve')}
		onReject={() => reviewDecision('reject')}
	/>
{/if}

{#if profileUserId !== null}
	<ProfileModal userId={profileUserId} onClose={() => (profileUserId = null)} />
{/if}
