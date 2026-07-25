<script lang="ts">
	import type { PublicTask } from '$lib/types/task';

	interface Props {
		task: PublicTask;
	}

	let { task }: Props = $props();

	const statusStyles: Record<PublicTask['status'], string> = {
		open: 'bg-blue-100 text-blue-700',
		pending: 'bg-yellow-100 text-yellow-700',
		approved: 'bg-green-100 text-green-700',
		succeeded: 'bg-green-100 text-green-700',
		failed: 'bg-red-100 text-red-700',
		cancelled: 'bg-gray-100 text-gray-700'
	};
</script>

<div
	class="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition hover:shadow-xl"
>
	<div class="flex items-center justify-between gap-3">
		<h3 class="text-lg font-semibold text-gray-800">{task.title}</h3>
		<span class={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
			{task.status}
		</span>
	</div>

	<p class="mt-2 text-sm font-medium text-gray-500">{task.category}</p>
	<p class="mt-3 text-gray-600">{task.location.address}</p>
</div>
