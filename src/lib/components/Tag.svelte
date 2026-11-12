<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TagTone } from '$lib/types/tag';

	interface Props {
		tone?: TagTone;
		children: Snippet;
	}

	let { tone = 'neutral', children }: Props = $props();

	const toneClasses: Record<TagTone, string> = {
		navy: 'bg-navy-tint text-navy',
		wait: 'bg-wait-tint text-wait',
		ok: 'bg-ok-tint text-ok',
		neutral: 'bg-fill text-ink-soft'
	};
</script>

<span
	class={[
		'inline-block rounded-xs px-2 text-sm leading-6 font-semibold whitespace-nowrap',
		toneClasses[tone]
	]}
>
	{@render children()}
</span>
