<script lang="ts">
	import type { NextStep } from '$lib/tasks/nextStep';
	import { actionLabel } from '$lib/tasks/actions';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';

	interface Props {
		step: NextStep;
		busy?: boolean;
		onAction?: () => void;
	}

	let { step, busy = false, onAction }: Props = $props();
</script>

<Inset>
	<div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
		<div>
			<p class="font-bold">{step.title}</p>
			<p class="text-ink-soft">{step.text}</p>
		</div>
		{#if step.action && onAction}
			<Button variant="primary" disabled={busy} onclick={onAction}>
				{actionLabel(step.action)}
			</Button>
		{/if}
	</div>
</Inset>
