<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'neutral';
		disabled?: boolean;
		href?: string;
		onclick?: () => void;
		children: Snippet;
	}

	let { variant = 'neutral', disabled = false, href, onclick, children }: Props = $props();

	const variantClasses: Record<'primary' | 'neutral', string> = {
		primary: 'bg-gray-900 text-white hover:bg-gray-800',
		neutral: 'border border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200'
	};

	const baseClasses =
		'rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
</script>

{#if href && !disabled}
	<a {href} class={`${baseClasses} ${variantClasses[variant]} inline-block`}>
		{@render children()}
	</a>
{:else}
	<button type="button" {disabled} {onclick} class={`${baseClasses} ${variantClasses[variant]}`}>
		{@render children()}
	</button>
{/if}
