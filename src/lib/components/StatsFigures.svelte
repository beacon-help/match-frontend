<script lang="ts">
	import type { Figure } from '$lib/stats/headline';

	interface Props {
		figures: Figure[];
	}

	let { figures }: Props = $props();
</script>

<dl class="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
	{#each figures as figure (figure.label)}
		<div class="flex flex-col-reverse">
			<dt class="text-base text-ink-soft">{figure.label}</dt>
			<dd class="text-3xl leading-tight font-semibold tabular-nums">{figure.value}</dd>
		</div>
	{/each}
</dl>
