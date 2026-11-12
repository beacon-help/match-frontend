<script lang="ts">
	import { resolve } from '$app/paths';
	import Page from '$lib/components/Page.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import PathChoice from '$lib/components/PathChoice.svelte';
</script>

<Page>
	<PageHeader
		title="Register"
		lede="Tell us why you are here, so we can set up the right account."
	/>

	<div class="grid border-t-2 border-b border-t-ink border-b-line sm:grid-cols-2">
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
</Page>
