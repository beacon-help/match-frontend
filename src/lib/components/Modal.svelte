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
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
	role="presentation"
	onclick={(e) => {
		if (e.target === e.currentTarget) onClose();
	}}
>
	<div
		class="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
		role="dialog"
		aria-modal="true"
		aria-label={title ?? 'Dialog'}
		tabindex="-1"
	>
		<div class="mb-4 flex items-center justify-between gap-4">
			{#if title}
				<h2 class="text-xl font-bold text-gray-800">{title}</h2>
			{:else}
				<span></span>
			{/if}
			<button
				type="button"
				onclick={onClose}
				aria-label="Close"
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
				</svg>
			</button>
		</div>

		{@render children()}
	</div>
</div>
