<script lang="ts">
	import config from 'virtual:match-config';
	import { resolve } from '$app/paths';
	import { MISSION_QUESTIONS } from '$lib/mission/faq';
	import Button from '$lib/components/Button.svelte';
	import Inset from '$lib/components/Inset.svelte';
	import Page from '$lib/components/Page.svelte';
</script>

<Page>
	<div class="grid gap-x-14 gap-y-10 lg:grid-cols-[1fr_1.3fr]">
		<div class="space-y-5">
			<p class="text-base font-semibold text-ink-soft">Our mission</p>
			<h1 class="text-3xl leading-tight font-bold tracking-tight sm:text-4xl sm:leading-tight">
				Every request for help in Valencia should find someone who can answer it.
			</h1>
			<p class="text-xl text-ink-soft">
				Match is a free, volunteer-run platform that connects people affected by the DANA with
				neighbours ready to help.
			</p>
			<Inset>
				<p class="font-bold">Questions or want to partner with us?</p>
				<p class="text-ink-soft">
					Write to <a
						href="mailto:{config.contact_email}"
						class="text-navy underline hover:text-navy-dark">{config.contact_email}</a
					>
				</p>
			</Inset>
		</div>

		<div class="border-t-2 border-ink">
			{#each MISSION_QUESTIONS as item, i (item.question)}
				<details open={i === 0} class="group border-b border-line">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-xl font-semibold [&::-webkit-details-marker]:hidden"
					>
						{item.question}
						<svg
							class="h-5 w-5 shrink-0 text-ink-soft group-open:rotate-180"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</summary>
					<div class="-mt-2 space-y-4 pb-4">
						<p>{item.answer}</p>
						{#if item.withSignupLinks}
							<div class="flex flex-wrap gap-3">
								<Button variant="primary" href={resolve('/signup/volunteer')}>I want to help</Button
								>
								<Button variant="primary" href={resolve('/signup/helpseeker')}>I need help</Button>
							</div>
						{/if}
					</div>
				</details>
			{/each}
		</div>
	</div>
</Page>
