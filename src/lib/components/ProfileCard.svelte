<script lang="ts">
	import type { UserSchema } from '$lib/api/user';

	interface Props {
		user: UserSchema;
	}

	let { user }: Props = $props();
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
	</dl>
</div>
