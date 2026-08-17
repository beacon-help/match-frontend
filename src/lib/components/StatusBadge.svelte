<script lang="ts">
	import type { TaskStatus } from '$lib/types/task';
	import { statusBadge } from '$lib/tasks/status';

	interface Props {
		status: TaskStatus;
	}

	let { status }: Props = $props();

	const badge = $derived(statusBadge(status));
</script>

<span class={`rounded-lg border px-3 py-2 text-sm font-medium ${badge.classes}`}>
	{badge.label}
</span>
