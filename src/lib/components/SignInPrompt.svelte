<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		/** Completes "You need to sign in …", e.g. "to view your tasks". */
		purpose: string;
	}

	let { purpose }: Props = $props();
</script>

<p class="text-gray-600">
	You need to <a href={resolve('/login')} class="font-medium text-blue-600 hover:text-blue-700"
		>sign in</a
	>
	{purpose}.
</p>
