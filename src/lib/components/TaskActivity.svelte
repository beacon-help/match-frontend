<script lang="ts">
	import type { TaskEvent } from '$lib/types/task';
	import { canReadEventMessage, eventSentence, formatEventTime } from '$lib/tasks/events';

	interface Props {
		events: TaskEvent[];
		ownerId: number;
		viewerId: number;
	}

	let { events, ownerId, viewerId }: Props = $props();

	const rows = $derived(
		events.map((event) => ({
			id: event.id,
			occurredAt: event.occurred_at,
			time: formatEventTime(event.occurred_at),
			sentence: eventSentence(event, viewerId),
			message: event.message,
			canReadMessage: canReadEventMessage(event, ownerId, viewerId)
		}))
	);
</script>

<aside class="min-w-0">
	<h2 class="border-b-2 border-ink pb-2 font-bold">Activity</h2>
	<ol>
		{#each rows as row (row.id)}
			<li class="border-b border-line py-3.5">
				<time datetime={row.occurredAt} class="block text-sm text-ink-soft">{row.time}</time>
				{row.sentence}
				{#if row.message && row.canReadMessage}
					<p class="mt-2 border-l-[3px] border-line pl-3 text-base text-ink-soft">
						“{row.message}”
					</p>
				{:else if row.message}
					<p class="mt-1 text-sm text-ink-soft italic">
						Message visible to the task owner and the helper
					</p>
				{/if}
			</li>
		{/each}
	</ol>
</aside>
