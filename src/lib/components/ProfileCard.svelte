<script lang="ts">
	import type { UserSchema } from '$lib/api/user';
	import { propertyLabels, roleLabel } from '$lib/profile/view';

	interface Props {
		user: UserSchema;
	}

	let { user }: Props = $props();

	const role = $derived(roleLabel(user.user_type));
	const isVolunteer = $derived(user.user_type === 'volunteer');
	const offers = $derived(propertyLabels(user.properties));
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<div class="flex items-center gap-4">
		<div
			class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700"
		>
			{user.first_name.charAt(0)}{user.last_name.charAt(0)}
		</div>
		<div>
			<h2 class="text-2xl font-bold text-gray-800">{user.first_name} {user.last_name}</h2>
			<p class="text-gray-600">{user.email}</p>
			<span
				class="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
				>{role}</span
			>
		</div>
	</div>

	<dl class="mt-6 space-y-3 border-t border-gray-100 pt-6">
		<div class="flex items-center justify-between">
			<dt class="text-sm font-medium text-gray-500">Email verified</dt>
			<dd>
				{#if user.is_verified}
					<span class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
						>Verified</span
					>
				{:else}
					<span class="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
						>Not verified</span
					>
				{/if}
			</dd>
		</div>
		{#if isVolunteer}
			<div>
				<dt class="text-sm font-medium text-gray-500">How can you help?</dt>
				<dd class="mt-2">
					{#if offers.length > 0}
						<ul class="flex flex-wrap gap-2">
							{#each offers as offer (offer)}
								<li class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{offer}</li>
							{/each}
						</ul>
					{:else}
						<p class="text-sm text-gray-600">Nothing selected yet.</p>
					{/if}
				</dd>
			</div>
		{/if}
	</dl>
</div>
