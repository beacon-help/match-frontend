<script lang="ts">
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
	import TextField from '$lib/components/TextField.svelte';
	import Button from '$lib/components/Button.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';

	// Valencia — the client-side radius filter is measured from here (geocoding is mocked).
	const CENTER = { lat: 39.47, lon: -0.38 };

	// Filters
	let searchAddress = $state('');
	let radiusKm = $state(50);
	let selectedCategories: string[] = $state([]);
	let filtersOpen = $state(false);

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

	const filterToggleLabel = $derived(filtersOpen ? 'Hide filters' : 'Show filters');
	const resultCount = $derived(
		filtered.length === 1 ? '1 task matches' : `${filtered.length} tasks match`
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

<Page>
	<PageHeader
		title="Find a task"
		lede="Requests from people near you. Offer help on any that you can take on."
	/>

	{#if authed.isLoading}
		<p class="text-ink-soft">Loading tasks…</p>
	{:else if authed.needsSignIn}
		<SignInPrompt purpose="to browse tasks" />
	{:else if authed.error}
		<p class="text-danger">{authed.error}</p>
	{:else}
		<div class="grid items-start gap-x-12 gap-y-9 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
			<aside>
				<div class="lg:hidden">
					<Button onclick={() => (filtersOpen = !filtersOpen)}>{filterToggleLabel}</Button>
				</div>
				<div class={['grid gap-6 max-lg:pt-5', !filtersOpen && 'max-lg:hidden']}>
					<!-- TODO: backend — no geocoding endpoint; filtering is measured from Valencia
					     regardless of what is typed here. -->
					<TextField label="Location" bind:value={searchAddress} placeholder="Search an address…" />

					<div>
						<label class="mb-1 block font-semibold" for="radius">Within {radiusKm} km</label>
						<input
							id="radius"
							type="range"
							min="1"
							max="100"
							bind:value={radiusKm}
							class="w-full accent-navy"
						/>
					</div>

					<CategoryCheckboxes bind:selected={selectedCategories} />
				</div>
			</aside>

			<div class="min-w-0">
				<HomeMap {markers} />

				<h2 class="mt-7 border-b-2 border-ink pb-2.5 font-bold">{resultCount}</h2>
				{#if filtered.length === 0}
					<p class="pt-4 text-ink-soft">No tasks match your filters.</p>
				{:else}
					<ul>
						{#each filtered as task (task.id)}
							<TaskCard
								{task}
								{currentUserId}
								busy={actions.busy}
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
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</Page>

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
