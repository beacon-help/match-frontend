<script lang="ts">
	import type { PublicUserSchema } from '$lib/api/user';
	import { roleLabel } from '$lib/profile/view';

	interface Props {
		user: PublicUserSchema;
	}

	let { user }: Props = $props();

	const role = $derived(roleLabel(user.user_type));
</script>

<div class="flex items-center gap-4">
	<div
		class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700"
	>
		{user.first_name.charAt(0)}
	</div>
	<div>
		<h2 class="text-2xl font-bold text-gray-800">{user.first_name}</h2>
		<span
			class="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
			>{role}</span
		>
	</div>
</div>
