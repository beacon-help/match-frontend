<script lang="ts">
	import { resolve } from '$app/paths';

	interface Props {
		/** Completes "You need to sign in …", e.g. "to view your tasks". */
		purpose: string;
	}

	let { purpose }: Props = $props();
</script>

<p class="text-ink-soft">
	You need to <a href={resolve('/login')} class="text-navy underline hover:text-navy-dark"
		>sign in</a
	>
	{purpose}.
</p>
