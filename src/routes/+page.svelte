<script lang="ts">
	import InfoCard from '$lib/components/InfoCard.svelte';
	import TaskForm from '$lib/components/TaskForm.svelte';

	let task = $state({
		title: '',
		description: '',
		author: ''
	});

	const cards = [
		{
			title: 'Need a transport',
			subtitle: '',
			description: 'Visually build and execute conditional tasks with logic gates and triggers.',
			author: 'Ben Scott'
		},
		{
			title: 'Offering clothes',
			subtitle: 'Monitoring Tool',
			description: 'Keep track of all events happening in your application in real time.',
			author: 'Alice'
		},
		{
			title: 'Looking for furnitures',
			subtitle: 'Analytics Panel',
			description: 'Beautifully designed dashboard with metrics and user insights.',
			author: 'Valdek Brown'
		}
	];
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Cases</h3>

	<div class="m-6 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each cards as card}
			<InfoCard {...card} />
		{/each}
	</div>
	<h3 class="mb-6 text-4xl font-bold">Post an issue</h3>

	<TaskForm {task} />
</section>
