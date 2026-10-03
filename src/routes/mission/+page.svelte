<script lang="ts">
	import { resolve } from '$app/paths';
	import { MISSION_QUESTIONS } from '$lib/mission/faq';

	const CONTACT_EMAIL = 'hello@match-valencia.org';
</script>

<main class="mx-auto max-w-[1000px] px-6 py-12">
	<div class="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
		<div class="space-y-5">
			<p class="text-sm font-semibold tracking-wider text-blue-600 uppercase">Our mission</p>
			<h1 class="text-3xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-4xl">
				Every request for help in Valencia should find someone who can answer it.
			</h1>
			<p class="text-lg leading-8 text-gray-700">
				Match is a free, volunteer-run platform that connects people affected by the DANA with
				neighbours ready to help.
			</p>
			<div class="space-y-3 rounded-2xl bg-gray-50 p-5">
				<p class="font-semibold text-gray-900">Questions or want to partner with us?</p>
				<p class="text-gray-600">
					Write to <a href="mailto:{CONTACT_EMAIL}" class="text-blue-600 hover:underline"
						>{CONTACT_EMAIL}</a
					>
				</p>
			</div>
		</div>

		<div class="divide-y divide-gray-200 border-y border-gray-200">
			{#each MISSION_QUESTIONS as item, i (item.question)}
				<details open={i === 0} class="group py-5">
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-gray-900 [&::-webkit-details-marker]:hidden"
					>
						{item.question}
						<svg
							class="h-5 w-5 shrink-0 text-gray-500 transition group-open:rotate-180"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</summary>
					<div class="mt-3 space-y-4">
						<p class="leading-7 text-gray-700">{item.answer}</p>
						{#if item.withSignupLinks}
							<div class="flex flex-wrap gap-3">
								<a
									href={resolve('/signup/volunteer')}
									class="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
								>
									I want to help
								</a>
								<a
									href={resolve('/signup/helpseeker')}
									class="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
								>
									I need help
								</a>
							</div>
						{/if}
					</div>
				</details>
			{/each}
		</div>
	</div>
</main>
