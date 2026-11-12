<script lang="ts">
	import type { TaskStatus } from '$lib/types/task';
	import type { TaskPermission } from '$lib/tasks/permission';
	import { statusBadge } from '$lib/tasks/status';
	import Tag from '$lib/components/Tag.svelte';

	interface Props {
		status: TaskStatus;
		permission?: TaskPermission;
	}

	let { status, permission = 'public' }: Props = $props();

	const badge = $derived(statusBadge(status, permission));
</script>

<Tag tone={badge.tone}>{badge.label}</Tag>
