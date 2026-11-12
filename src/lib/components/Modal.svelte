<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		onClose: () => void;
		children: Snippet;
	}

	let { title, onClose, children }: Props = $props();

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={onKeydown} />

<!-- Overlay: clicking the backdrop (but not the card) closes. Escape is handled on window. -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) onClose();
	}}
>
	<div
		class="relative max-h-full w-full max-w-lg overflow-y-auto border border-line bg-white p-5 shadow-lg sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-label={title ?? 'Dialog'}
		tabindex="-1"
	>
		<div class="mb-4 flex items-center justify-between gap-4">
			{#if title}
				<h2 class="text-2xl font-bold">{title}</h2>
			{:else}
				<span></span>
			{/if}
			<button
				type="button"
				onclick={onClose}
				aria-label="Close"
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs text-ink-soft hover:bg-fill hover:text-ink"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		{@render children()}
	</div>
</div>
