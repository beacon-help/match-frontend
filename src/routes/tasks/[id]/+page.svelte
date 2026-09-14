<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask } from '$lib/api/task';
	import { taskPermission } from '$lib/tasks/permission';
	import { helperOfferMessage } from '$lib/tasks/offers';
	import { imageSrc } from '$lib/tasks/images';
	import { createTaskActionRunner } from '$lib/tasks/actionRunner.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import { session } from '$lib/auth/session.svelte';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';
	import OfferHelpModal from '$lib/components/OfferHelpModal.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';

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

<section class="container mx-auto max-w-3xl px-4 py-10">
	{#if authed.isLoading}
		<p class="text-gray-600">Loading task…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view this task" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
	{:else if task}
		<div class="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h1 class="text-3xl font-bold text-gray-900">{task.title}</h1>
				<StatusBadge status={task.status} />
			</div>

			<HomeMap {markers} />

			{#if task.images.length > 0}
				<div class="grid grid-cols-3 gap-3">
					{#each task.images as image, i (image.id)}
						<img
							src={imageSrc(image.path)}
							alt="Task photo {i + 1}"
							class="aspect-[3/2] w-full rounded-lg object-cover"
						/>
					{/each}
				</div>
			{/if}

			<p class="text-gray-700">{task.description}</p>

			<dl class="grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
				<div>
					<dt class="text-sm font-medium text-gray-500">Category</dt>
					<dd class="text-gray-900">{task.category}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-500">Location</dt>
					<dd class="text-gray-900">{task.location.address}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-500">Posted</dt>
					<dd class="text-gray-900">{postedAt}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-gray-500">Owner</dt>
					<dd class="text-gray-900">{task.owner.first_name}</dd>
				</div>
			</dl>

			{#if actionError}
				<p class="text-sm text-red-600">{actionError}</p>
			{/if}

			<TaskActionsBar
				{task}
				{permission}
				hideSeeMore
				busy={actions.busy}
				onOfferHelp={() => {
					actionError = null;
					showOffer = true;
				}}
				onReview={() => {
					actionError = null;
					showReview = true;
				}}
				onSeeOwner={() => task && (profileUserId = task.owner.id)}
				onSeeHelper={() => task?.helper && (profileUserId = task.helper.id)}
				onMarkDone={() => runAction('report_success')}
				onRemove={() => runAction('close')}
				onCancel={() => runAction('close')}
				onEdit={() => goto(resolve('/tasks/[id]/edit', { id: String(taskId) }))}
			/>
		</div>
	{/if}
</section>

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
