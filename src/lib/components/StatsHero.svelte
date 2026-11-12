<script lang="ts">
	import { resolve } from '$app/paths';
	import type { UserType } from '$lib/api/user';
	import type { Stats } from '$lib/types/stats';
	import { statsSentence } from '$lib/stats/headline';
	import Button from '$lib/components/Button.svelte';
	import PathChoice from '$lib/components/PathChoice.svelte';

	interface Props {
		stats: Stats | null;
		role: UserType | null;
	}

	let { stats, role }: Props = $props();

	const sentence = $derived(statsSentence(stats));
</script>

<section aria-labelledby="stats-hero-title" class="pt-6 pb-6 sm:pt-14 sm:pb-7">
	<h1
		id="stats-hero-title"
		class="max-w-[22ch] text-3xl leading-[1.1] font-bold tracking-tight sm:text-5xl sm:leading-[1.1]"
	>
		Neighbours helping neighbours after the DANA.
	</h1>
	<p class="mt-2 max-w-[60ch] text-ink-soft sm:mt-3 sm:text-xl">{sentence}</p>

	{#if role === 'volunteer'}
		<div class="mt-5 flex flex-wrap gap-3 sm:mt-8 sm:border-b sm:border-line sm:pb-8">
			<Button variant="primary" href={resolve('/tasks/search')}>Find a task</Button>
			<Button href={resolve('/tasks')}>My tasks</Button>
		</div>
	{:else if role === 'help-seeker'}
		<div class="mt-5 flex flex-wrap gap-3 sm:mt-8 sm:border-b sm:border-line sm:pb-8">
			<Button variant="primary" href={resolve('/tasks/create')}>Ask for help</Button>
			<Button href={resolve('/tasks')}>My tasks</Button>
		</div>
	{:else}
		<div class="mt-5 grid grid-cols-2 gap-2 sm:hidden">
			<Button variant="primary" href={resolve('/signup/helpseeker')}>I need help</Button>
			<Button variant="primary" href={resolve('/signup/volunteer')}>I want to help</Button>
		</div>
		<div class="mt-9 hidden border-t-2 border-b border-t-ink border-b-line sm:grid sm:grid-cols-2">
			<PathChoice
				title="I need help"
				text="Describe one thing you need. Volunteers near you will see it."
				href={resolve('/signup/helpseeker')}
				cta="Sign up to get help"
			/>
			<PathChoice
				title="I want to help"
				text="See what people near you need, and offer what you can."
				href={resolve('/signup/volunteer')}
				cta="Sign up to volunteer"
			/>
		</div>
	{/if}
</section>
