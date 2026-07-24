<script lang="ts">
	// Define the structure of the task
	type Task = {
		title: string;
		description: string;
		author: string;
	};

	interface Props {
		task: Task;
	}

	let { task }: Props = $props();
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">📝 Create a New Task</h2>

	<div class="space-y-4">
		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="title">Title</label>
			<input
				id="title"
				type="text"
				bind:value={task.title}
				placeholder="e.g. Fix login bug"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="description"
				>Description</label
			>
			<textarea
				id="description"
				rows="4"
				bind:value={task.description}
				placeholder="Describe the task..."
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="author">Author</label>
			<input
				id="author"
				type="text"
				bind:value={task.author}
				placeholder="e.g. Alex"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
	</div>
</div>
