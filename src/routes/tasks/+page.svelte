<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { listMyTasks, manageTask } from '$lib/api/task';
	import { getAccessToken } from '$lib/auth/tokens';
	import { ApiError, describeApiError } from '$lib/api/client';
	import type { Task } from '$lib/types/task';
	import MyTaskCard from '$lib/components/MyTaskCard.svelte';
	import Button from '$lib/components/Button.svelte';

	let tasks: Task[] = $state([]);
	let isLoading = $state(true);
	let error: string | null = $state(null);
	// True when there is no usable session (no token, or the token was rejected) — the
	// user needs to sign in before we can show their tasks.
	let needsSignIn = $state(false);

	onMount(async () => {
		const token = getAccessToken();
		if (!token) {
			needsSignIn = true;
			isLoading = false;
			return;
		}

		try {
			tasks = await listMyTasks(token);
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

	async function updateTask(taskId: number, action: 'close' | 'report_success') {
		const token = getAccessToken();
		if (!token) return;

		try {
			const updated = await manageTask(taskId, action, token);
			tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
		} catch (err) {
			error = describeApiError(err);
		}
	}
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">My Tasks</h3>

	{#if isLoading}
		<p class="text-gray-600">Loading your tasks…</p>
	{:else if needsSignIn}
		<p class="text-gray-600">
			You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
				>sign in</a
			> to view your tasks.
		</p>
	{:else if error}
		<p class="text-red-600">{error}</p>
	{:else if tasks.length === 0}
		<div class="flex flex-col items-center gap-8 py-24 text-center">
			<p class="max-w-sm text-gray-900">
				You haven't created any tasks yet. If there's anything you need help with, feel free to get
				started.
			</p>
			<Button variant="primary" href={resolve('/tasks/create')}>I need help</Button>
		</div>
	{:else}
		<div class="space-y-6">
			{#each tasks as task (task.id)}
				<MyTaskCard
					{task}
					onRemove={() => updateTask(task.id, 'close')}
					onMarkDone={() => updateTask(task.id, 'report_success')}
				/>
			{/each}
		</div>
	{/if}
</section>
