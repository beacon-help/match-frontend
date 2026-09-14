<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { listTasks } from '$lib/api/task';
	import { haversineKm, locationLatLon } from '$lib/tasks/distance';
	import { helperOfferMessage } from '$lib/tasks/offers';
	import { createTaskActionRunner } from '$lib/tasks/actionRunner.svelte';
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';
	import { session } from '$lib/auth/session.svelte';
	import type { Task } from '$lib/types/task';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import CategoryCheckboxes from '$lib/components/CategoryCheckboxes.svelte';
	import OfferHelpModal from '$lib/components/OfferHelpModal.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';
	import SignInPrompt from '$lib/components/SignInPrompt.svelte';

	// Valencia — the client-side radius filter is measured from here (geocoding is mocked).
	const CENTER = { lat: 39.47, lon: -0.38 };

	// Filters
	let searchAddress = $state('');
	let radiusKm = $state(50);
	let selectedCategories: string[] = $state([]);

	// Interactions
	let offerTask: Task | null = $state(null);
	let reviewTask: Task | null = $state(null);
	let profileUserId: number | null = $state(null);
	let actionError: string | null = $state(null);

	const authed = createAuthedPage((token) => listTasks(token));

	const allTasks = $derived(authed.data ?? []);
	const currentUserId = $derived(session.user?.id ?? 0);

	const actions = createTaskActionRunner((updated) => {
		authed.data = allTasks.map((t) => (t.id === updated.id ? updated : t));
	});

	const filtered = $derived(
		allTasks.filter((t) => {
			if (selectedCategories.length > 0 && !selectedCategories.includes(t.category)) {
				return false;
			}
			const ll = locationLatLon(t.location);
			// Keep tasks without usable coordinates so they remain discoverable.
			if (!ll) return true;
			return haversineKm(CENTER, ll) <= radiusKm;
		})
	);

	const markers = $derived(
		filtered
			.map((t) => {
				const ll = locationLatLon(t.location);
				return ll ? { lat: ll.lat, lon: ll.lon, label: t.title } : null;
			})
			.filter((m): m is { lat: number; lon: number; label: string } => m !== null)
	);

	// Runs a direct backend action (close / report_success) and syncs the list.
	function runAction(task: Task, action: 'close' | 'report_success') {
		return actions.runAction(task, action, (msg) => (authed.error = msg));
	}

	async function submitOffer(message: string) {
		if (!offerTask) return;
		const updated = await actions.submitOffer(offerTask, message, (msg) => (actionError = msg));
		if (updated) offerTask = null;
	}

	async function reviewDecision(action: 'approve' | 'reject') {
		if (!reviewTask) return;
		const updated = await actions.reviewDecision(reviewTask, action, (msg) => (actionError = msg));
		if (updated) reviewTask = null;
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Search Task</h3>

	{#if authed.isLoading}
		<p class="text-gray-600">Loading tasks…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to browse tasks" />
	{:else if authed.error}
		<p class="text-red-600">{authed.error}</p>
	{:else}
		<div class="grid gap-8 lg:grid-cols-[300px_1fr]">
			<aside class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium text-gray-700" for="search-address">Location</label>
					<!-- TODO: backend — no geocoding endpoint; filtering is measured from Valencia
					     regardless of what is typed here. -->
					<input
						id="search-address"
						type="text"
						bind:value={searchAddress}
						placeholder="Search an address…"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium text-gray-700" for="radius">
						Radius: {radiusKm} km
					</label>
					<input id="radius" type="range" min="1" max="100" bind:value={radiusKm} class="w-full" />
				</div>

				<CategoryCheckboxes bind:selected={selectedCategories} />
			</aside>

			<div class="flex flex-col gap-6">
				<HomeMap {markers} />

				{#if filtered.length === 0}
					<p class="text-gray-600">No tasks match your filters.</p>
				{:else}
					<div class="grid gap-4 sm:grid-cols-2">
						{#each filtered as task (task.id)}
							<TaskCard
								{task}
								{currentUserId}
								busy={actions.busy}
								onSeeMore={() => goto(resolve('/tasks/[id]', { id: String(task.id) }))}
								onOfferHelp={() => {
									actionError = null;
									offerTask = task;
								}}
								onReview={() => {
									actionError = null;
									reviewTask = task;
								}}
								onSeeOwner={() => (profileUserId = task.owner.id)}
								onSeeHelper={() => task.helper && (profileUserId = task.helper.id)}
								onMarkDone={() => runAction(task, 'report_success')}
								onRemove={() => runAction(task, 'close')}
								onCancel={() => runAction(task, 'close')}
							/>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</section>

{#if offerTask}
	<OfferHelpModal
		task={offerTask}
		isSubmitting={actions.busy}
		error={actionError}
		onClose={() => (offerTask = null)}
		onSubmit={submitOffer}
	/>
{/if}

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
