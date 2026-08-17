<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { listTasks, manageTask } from '$lib/api/task';
	import { getMe } from '$lib/api/user';
	import { getAccessToken } from '$lib/auth/tokens';
	import { ApiError, describeApiError } from '$lib/api/client';
	import { haversineKm, locationLatLon } from '$lib/tasks/distance';
	import { saveOfferMessage, getOfferMessage } from '$lib/tasks/offerMessages';
	import type { Task } from '$lib/types/task';
	import HomeMap from '$lib/components/HomeMap.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import CategoryCheckboxes from '$lib/components/CategoryCheckboxes.svelte';
	import OfferHelpModal from '$lib/components/OfferHelpModal.svelte';
	import ReviewOfferModal from '$lib/components/ReviewOfferModal.svelte';
	import ProfileModal from '$lib/components/ProfileModal.svelte';

	// Valencia — the client-side radius filter is measured from here (geocoding is mocked).
	const CENTER = { lat: 39.47, lon: -0.38 };

	let currentUserId = $state(0);
	let allTasks: Task[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	let needsSignIn = $state(false);

	// Filters
	let searchAddress = $state('');
	let radiusKm = $state(50);
	let selectedCategories: string[] = $state([]);

	// Interactions
	let offerTask: Task | null = $state(null);
	let reviewTask: Task | null = $state(null);
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
			const [me, tasks] = await Promise.all([getMe(token), listTasks(token)]);
			currentUserId = me.id;
			allTasks = tasks;
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

	function replaceTask(updated: Task) {
		allTasks = allTasks.map((t) => (t.id === updated.id ? updated : t));
	}

	// Runs a direct backend action (close / report_success) and syncs the list.
	async function runAction(task: Task, action: 'close' | 'report_success') {
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		actionError = null;
		try {
			replaceTask(await manageTask(task.id, action, token));
		} catch (err) {
			error = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}

	async function submitOffer(message: string) {
		if (!offerTask) return;
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		actionError = null;
		try {
			const updated = await manageTask(offerTask.id, 'join', token);
			saveOfferMessage(offerTask.id, message); // mock-persist (no backend field)
			replaceTask(updated);
			offerTask = null;
		} catch (err) {
			actionError = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}

	async function reviewDecision(action: 'approve' | 'reject') {
		if (!reviewTask) return;
		const token = getAccessToken();
		if (!token) return;
		actionBusy = true;
		actionError = null;
		try {
			const updated = await manageTask(reviewTask.id, action, token, reviewTask.helper?.id);
			replaceTask(updated);
			reviewTask = null;
		} catch (err) {
			actionError = describeApiError(err);
		} finally {
			actionBusy = false;
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Search Task</h3>

	{#if isLoading}
		<p class="text-gray-600">Loading tasks…</p>
	{:else if needsSignIn}
		<p class="text-gray-600">
			You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
				>sign in</a
			> to browse tasks.
		</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else}
		<div class="grid gap-8 lg:grid-cols-[300px_1fr]">
			<aside class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<label class="text-sm font-medium text-gray-700" for="search-address">Location</label>
					<!-- Mock geocode: filtering is measured from Valencia regardless of input. -->
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

				<CategoryCheckboxes bind:selected={selectedCategories} mode="filter" />
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
								busy={actionBusy}
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
		isSubmitting={actionBusy}
		error={actionError}
		onClose={() => (offerTask = null)}
		onSubmit={submitOffer}
	/>
{/if}

{#if reviewTask}
	<ReviewOfferModal
		task={reviewTask}
		message={getOfferMessage(reviewTask.id)}
		isSubmitting={actionBusy}
		error={actionError}
		onClose={() => (reviewTask = null)}
		onAccept={() => reviewDecision('approve')}
		onReject={() => reviewDecision('reject')}
	/>
{/if}

{#if profileUserId !== null}
	<ProfileModal userId={profileUserId} onClose={() => (profileUserId = null)} />
{/if}
