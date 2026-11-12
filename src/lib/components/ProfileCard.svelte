<script lang="ts">
	import type { UserSchema } from '$lib/api/user';
	import { propertyLabels, roleLabel } from '$lib/profile/view';
	import Tag from '$lib/components/Tag.svelte';
	import SummaryRow from '$lib/components/SummaryRow.svelte';

	interface Props {
		user: UserSchema;
	}

	let { user }: Props = $props();

	const role = $derived(roleLabel(user.user_type));
	const isVolunteer = $derived(user.user_type === 'volunteer');
	const offers = $derived(propertyLabels(user.properties));
</script>

<div class="max-w-xl">
	<h2 class="text-2xl font-bold">{user.first_name} {user.last_name}</h2>

	<dl class="mt-4 border-t border-line">
		<SummaryRow label="Role">{role}</SummaryRow>
		<SummaryRow label="Email">{user.email}</SummaryRow>
		<SummaryRow label="Email verified">
			{#if user.is_verified}
				<Tag tone="ok">Verified</Tag>
			{:else}
				<Tag tone="wait">Not verified</Tag>
			{/if}
		</SummaryRow>
		{#if isVolunteer}
			<SummaryRow label="How can you help?">
				{#if offers.length > 0}
					<ul>
						{#each offers as offer (offer)}
							<li>{offer}</li>
						{/each}
					</ul>
				{:else}
					<p class="text-ink-soft">Nothing selected yet.</p>
				{/if}
			</SummaryRow>
		{/if}
	</dl>
</div>
