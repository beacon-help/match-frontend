<script lang="ts">
	import { onMount } from 'svelte';
	import { listPublicTasks } from '$lib/api/task';
	import { describeApiError } from '$lib/api/client';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';
	import type { PublicTask } from '$lib/types/task';

	let task = $state({
		title: '',
		description: '',
		author: ''
	});

	let publicTasks = $state<PublicTask[]>([]);
	let isLoadingTasks = $state(true);
	let loadTasksError = $state('');

	onMount(async () => {
		try {
			publicTasks = await listPublicTasks();
		} catch (err) {
			loadTasksError = describeApiError(err);
		} finally {
			isLoadingTasks = false;
		}
	});
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Cases</h3>

	{#if isLoadingTasks}
		<p class="text-gray-500">Loading tasks…</p>
	{:else if loadTasksError}
		<p class="text-red-600">{loadTasksError}</p>
	{:else if publicTasks.length === 0}
		<p class="text-gray-500">No open tasks right now.</p>
	{:else}
		<div class="m-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each publicTasks as publicTask (publicTask.id)}
				<TaskCard task={publicTask} />
			{/each}
		</div>
	{/if}

	<h3 class="mb-6 text-4xl font-bold">Post an issue</h3>

	<TaskForm {task} />
</section>
