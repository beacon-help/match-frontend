<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isServerUp, safeReturnPath } from '$lib/api/availability';
	import Button from '$lib/components/Button.svelte';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Inset from '$lib/components/Inset.svelte';

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

<Page>
	<div class="max-w-xl">
		<PageHeader title="We can’t reach Match Valencia" />
		<p>
			Our server isn’t answering right now. If you were sending something, such as an offer or a new
			task, it may not have been saved. Check it once you’re back.
		</p>
		<div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
			<Button variant="primary" disabled={checking} onclick={tryAgain}>
				{checking ? 'Checking…' : 'Try again'}
			</Button>
			<p class="text-base text-ink-soft">No answer from the server · {lastChecked}</p>
		</div>

		<div class="mt-10">
			<Inset>
				<p class="font-bold">Need help urgently?</p>
				<p>
					Call <b class="font-bold">112</b>, the emergency number in Spain. It’s free from any
					phone, works without credit, and they answer in English.
				</p>
			</Inset>
		</div>
	</div>
</Page>
