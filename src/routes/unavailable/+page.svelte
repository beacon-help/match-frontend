<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isServerUp, safeReturnPath } from '$lib/api/availability';
	import Button from '$lib/components/Button.svelte';

	let checking = $state(false);
	let lastCheckedAt = $state(new Date());

	const lastChecked = $derived(
		lastCheckedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
	);

	async function tryAgain() {
		checking = true;
		if (await isServerUp()) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- safeReturnPath only returns same-site paths
			await goto(safeReturnPath(page.url.searchParams.get('from')));
			return;
		}
		lastCheckedAt = new Date();
		checking = false;
	}
</script>

<section class="container mx-auto flex justify-center px-4 py-16">
	<div class="flex max-w-md flex-col items-center gap-4 text-center">
		<span class="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				class="text-gray-500"
				aria-hidden="true"
			>
				<path d="M3 3l18 18" />
				<path d="M8.5 16.5a5 5 0 0 1 7 0" />
				<path d="M5 12.9a10 10 0 0 1 5.1-2.8" />
				<path d="M19 12.9a10 10 0 0 0-2-1.5" />
				<circle cx="12" cy="20" r="0.6" fill="currentColor" />
			</svg>
		</span>
		<h1 class="text-2xl font-bold text-gray-900">We can’t reach Match Valencia</h1>
		<p class="text-gray-600">
			Our server isn’t answering right now. If you were sending something, such as an offer or a new
			task, it may not have been saved. Check it once you’re back.
		</p>
		<div class="flex flex-wrap justify-center gap-3 pt-2">
			<Button variant="primary" disabled={checking} onclick={tryAgain}>
				{checking ? 'Checking…' : 'Try again'}
			</Button>
		</div>
		<p class="text-xs text-gray-400">No answer from the server · {lastChecked}</p>

		<div
			class="mt-4 flex flex-col gap-1 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left"
		>
			<p class="font-semibold text-gray-900">Need help urgently?</p>
			<p class="text-gray-700">
				Call <b class="font-semibold">112</b>, the emergency number in Spain. It’s free from any
				phone, works without credit, and they answer in English.
			</p>
		</div>
	</div>
</section>
