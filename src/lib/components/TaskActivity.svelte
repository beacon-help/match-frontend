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

<aside
	class="flex min-w-0 flex-col gap-3 self-start rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
>
	<h2 class="text-lg font-semibold text-gray-900">Activity</h2>
	<table class="w-full text-sm">
		<tbody class="divide-y divide-gray-100">
			{#each rows as row (row.id)}
				<tr>
					<td class="py-2 pr-4 align-top whitespace-nowrap text-gray-500">
						<time datetime={row.occurredAt}>{row.time}</time>
					</td>
					<td class="py-2 text-gray-900">
						{row.sentence}
						{#if row.message && row.canReadMessage}
							<p class="text-gray-600">“{row.message}”</p>
						{:else if row.message}
							<p class="mt-1 text-xs text-gray-400 italic">
								Message visible to the task owner and the helper
							</p>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</aside>
