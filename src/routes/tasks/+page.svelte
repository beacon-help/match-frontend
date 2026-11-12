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
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	let reviewTask: Task | null = $state(null);
	let profileUserId: number | null = $state(null);
	let actionError: string | null = $state(null);

	const authed = createAuthedPage((token) => listMyTasks(token));

	const tasks = $derived(authed.data ?? []);
	const currentUserId = $derived(session.user?.id ?? 0);

	const actions = createTaskActionRunner((updated) => {
		authed.data = tasks.map((t) => (t.id === updated.id ? updated : t));
	});

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

<Page>
	<PageHeader title="My tasks">
		{#snippet action()}
			{#if isVolunteer}
				<Button variant="primary" href={resolve('/tasks/search')}>Find a task</Button>
			{:else}
				<Button variant="primary" href={resolve('/tasks/create')}>Ask for help</Button>
			{/if}
		{/snippet}
	</PageHeader>

	{#if authed.isLoading}
		<p class="text-ink-soft">Loading your tasks…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to view your tasks" />
	{:else if authed.error}
		<p class="text-danger">{authed.error}</p>
	{:else if tasks.length === 0}
		<p class="max-w-[52ch] border-t-2 border-ink pt-5">
			{#if isVolunteer}
				You haven't offered to help with any tasks yet. Browse open tasks to find someone who needs
				a hand.
			{:else}
				You haven't created any tasks yet. If there's anything you need help with, feel free to get
				started.
			{/if}
		</p>
	{:else}
		<ul class="border-t-2 border-ink">
			{#each tasks as task (task.id)}
				<MyTaskCard
					{task}
					{currentUserId}
					busy={actions.busy}
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
		</ul>
	{/if}
</Page>

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
