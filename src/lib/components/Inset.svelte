<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tone?: 'info' | 'error';
		children: Snippet;
	}

	let { tone = 'info', children }: Props = $props();

	const toneClasses: Record<NonNullable<Props['tone']>, string> = {
		info: 'border-navy',
		error: 'border-danger text-danger'
	};
</script>

<div class={['border-l-4 bg-fill px-5 py-4', toneClasses[tone]]}>
	{@render children()}
</div>
