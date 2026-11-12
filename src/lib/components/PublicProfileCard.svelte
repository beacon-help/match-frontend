<script lang="ts">
	import type { PublicUserSchema } from '$lib/api/user';
	import { roleLabel } from '$lib/profile/view';

	interface Props {
		user: PublicUserSchema;
	}

	let { user }: Props = $props();

	const role = $derived(roleLabel(user.user_type));
</script>

<div>
	<h2 class="text-2xl font-bold">{user.first_name}</h2>
	<p class="text-ink-soft">{role}</p>
</div>
