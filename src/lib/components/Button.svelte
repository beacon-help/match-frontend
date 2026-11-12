<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		variant?: 'primary' | 'neutral' | 'link' | 'danger';
		type?: 'button' | 'submit';
		disabled?: boolean;
		href?: ResolvedPathname;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'neutral',
		type = 'button',
		disabled = false,
		href,
		onclick,
		children
	}: Props = $props();

	const variantClasses: Record<NonNullable<Props['variant']>, string> = {
		primary: 'bg-navy px-4 font-semibold text-white hover:bg-navy-dark',
		neutral: 'border border-field bg-white px-4 font-semibold text-ink hover:border-ink',
		link: 'px-1 text-navy underline underline-offset-3 hover:text-navy-dark',
		danger: 'px-1 text-danger underline underline-offset-3 hover:decoration-2'
	};

	const baseClasses =
		'inline-flex min-h-11 items-center justify-center rounded-xs text-base whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50';
</script>

{#if href && !disabled}
	<a {href} class={[baseClasses, variantClasses[variant]]}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} {onclick} class={[baseClasses, variantClasses[variant]]}>
		{@render children()}
	</button>
{/if}
