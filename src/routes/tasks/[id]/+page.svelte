<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getTask, manageTask } from '$lib/api/task';
	import { getMe } from '$lib/api/user';
	import { getAccessToken } from '$lib/auth/tokens';
	import { ApiError, describeApiError } from '$lib/api/client';
	import { taskPermission } from '$lib/tasks/permission';
	import { saveOfferMessage, getOfferMessage } from '$lib/tasks/offerMessages';
	import type { Task } from '$lib/types/task';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import TaskActionsBar from '$lib/components/TaskActionsBar.svelte';
	import OfferHelpModal from '$lib/components/OfferHelpModal.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';

	const taskId = Number(page.params.id);

	let task = $state<Task | null>(null);
	let currentUserId = $state(0);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let needsSignIn = $state(false);

	let showOffer = $state(false);
	let showReview = $state(false);
	let profileUserId: number | null = $state(null);
	let actionBusy = $state(false);
	let actionError: string | null = $state(null);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

		try {
			const [me, loaded] = await Promise.all([getMe(token), getTask(taskId, token)]);
			currentUserId = me.id;
			task = loaded;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				needsSignIn = true;
			} else {
				error = describeApiError(err);
			}
		} finally {
			isLoading = false;
		}
	});

	const permission = $derived(task ? taskPermission(task, currentUserId) : 'public');
	const markers = $derived(
		task
			? [
					{ lat: Number(task.location.lat), lon: Number(task.location.lon), label: task.title }
				].filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lon))
			: []
	);
	// TODO: backend — GET /task/{id} returns no images; the gallery uses placeholders.
	const gallery = $derived(
		[1, 2, 3].map((n) => `https://picsum.photos/seed/task-${taskId}-${n}/600/400`)
	);

	const postedAt = $derived(
		task ? new Date(task.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''
	);

	async function runAction(action: 'close' | 'report_success') {
		if (!task) return;
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		try {
			task = await manageTask(task.id, action, token);
		} catch (err) {
			error = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}

	async function submitOffer(message: string) {
		if (!task) return;
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		actionError = null;
		try {
			task = await manageTask(task.id, 'join', token);
			saveOfferMessage(taskId, message); // mock-persist (no backend field)
			showOffer = false;
		} catch (err) {
			actionError = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}

	async function reviewDecision(action: 'approve' | 'reject') {
		if (!task) return;
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		actionError = null;
		try {
			task = await manageTask(task.id, action, token, task.helper?.id);
			showReview = false;
		} catch (err) {
			actionError = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}
</script>

<section class="container mx-auto max-w-3xl px-4 py-10">
	{#if isLoading}
		<p class="text-gray-600">Loading task…</p>
	{:else if needsSignIn}
		<p class="text-gray-600">
			You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
				>sign in</a
			> to view this task.
		</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if task}
		<div class="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h1 class="text-3xl font-bold text-gray-900">{task.title}</h1>
				<StatusBadge status={task.status} />
			</div>

			<HomeMap {markers} />

			<div class="grid grid-cols-3 gap-3">
				{#each gallery as src, i (src)}
					<img {src} alt="Task photo {i + 1}" class="aspect-[3/2] w-full rounded-lg object-cover" />
				{/each}
			</div>

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
				busy={actionBusy}
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
		isSubmitting={actionBusy}
		error={actionError}
		onClose={() => (showOffer = false)}
		onSubmit={submitOffer}
	/>
{/if}

{#if showReview && task}
	<ReviewOfferModal
		{task}
		message={getOfferMessage(taskId)}
		isSubmitting={actionBusy}
		error={actionError}
		onClose={() => (showReview = false)}
		onAccept={() => reviewDecision('approve')}
		onReject={() => reviewDecision('reject')}
	/>
{/if}

{#if profileUserId !== null}
	<ProfileModal userId={profileUserId} onClose={() => (profileUserId = null)} />
{/if}
