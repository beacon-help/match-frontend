<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { listMyTasks } from '$lib/api/task';
	import { session } from '$lib/auth/session.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import { helperOfferMessage } from '$lib/tasks/offers';
	import { createTaskActionRunner } from '$lib/tasks/actionRunner.svelte';
	import type { Task } from '$lib/types/task';
	import MyTaskCard from '$lib/components/MyTaskCard.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';
	import Button from '$lib/components/Button.svelte';

	let reviewTask: Task | null = $state(null);
	let profileUserId: number | null = $state(null);
	let actionError: string | null = $state(null);

	const authed = createAuthedPage((token) => listMyTasks(token));

	const tasks = $derived(authed.data ?? []);
	const currentUserId = $derived(session.user?.id ?? 0);

	const actions = createTaskActionRunner((updated) => {
		authed.data = tasks.map((t) => (t.id === updated.id ? updated : t));
	});

	// Volunteers land on Search from the empty state; help-seekers land on Create Task.
	const isVolunteer = $derived(session.role === 'volunteer');

	function runAction(task: Task, action: 'close' | 'report_success') {
		return actions.runAction(task, action, (msg) => (authed.error = msg));
	}

	async function reviewDecision(action: 'approve' | 'reject') {
		if (!reviewTask) return;
		const updated = await actions.reviewDecision(reviewTask, action, (msg) => (actionError = msg));
		if (updated) reviewTask = null;
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">My Tasks</h3>

	{#if authed.isLoading}
		<p class="text-gray-600">Loading your tasks…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view your tasks" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
	{:else if tasks.length === 0}
		<div class="flex flex-col items-center gap-8 py-24 text-center">
			{#if isVolunteer}
				<p class="max-w-sm text-gray-900">
					You haven't offered to help with any tasks yet. Browse open tasks to find someone who
					needs a hand.
				</p>
				<Button variant="primary" href={resolve('/tasks/search')}>Search tasks</Button>
			{:else}
				<p class="max-w-sm text-gray-900">
					You haven't created any tasks yet. If there's anything you need help with, feel free to
					get started.
				</p>
				<Button variant="primary" href={resolve('/tasks/create')}>I need help</Button>
			{/if}
		</div>
	{:else}
		<div class="space-y-6">
			{#each tasks as task (task.id)}
				<MyTaskCard
					{task}
					{currentUserId}
					busy={actions.busy}
					onSeeMore={() => goto(resolve('/tasks/[id]', { id: String(task.id) }))}
					onEdit={() => goto(resolve('/tasks/[id]/edit', { id: String(task.id) }))}
					onReview={() => {
						actionError = null;
						reviewTask = task;
					}}
					onSeeHelper={() => task.helper && (profileUserId = task.helper.id)}
					onSeeOwner={() => (profileUserId = task.owner.id)}
					onMarkDone={() => runAction(task, 'report_success')}
					onRemove={() => runAction(task, 'close')}
					onCancel={() => runAction(task, 'close')}
				/>
			{/each}
		</div>
	{/if}
</section>

{#if reviewTask}
	<ReviewOfferModal
		task={reviewTask}
		message={helperOfferMessage(reviewTask, reviewTask.helper?.id)}
		isSubmitting={actions.busy}
		error={actionError}
		onClose={() => (reviewTask = null)}
		onAccept={() => reviewDecision('approve')}
		onReject={() => reviewDecision('reject')}
	/>
{/if}

{#if profileUserId !== null}
	<ProfileModal userId={profileUserId} onClose={() => (profileUserId = null)} />
{/if}
