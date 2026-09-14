<script lang="ts">
	import { createAuthedPage } from '$lib/auth/authedPage.svelte';

	interface Props {
		load?: (token: string) => Promise<string>;
	}

	let { load = async () => 'none' }: Props = $props();

	const authed = createAuthedPage((token) => load(token));
</script>

<p data-testid="state">
	{authed.isLoading
		? 'loading'
		: authed.needsSignIn
			? 'needs-sign-in'
			: authed.error
				? `error:${authed.error}`
				: `data:${authed.data}`}
</p>
