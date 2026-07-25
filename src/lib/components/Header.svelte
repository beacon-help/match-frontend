<script lang="ts">
	import { resolve } from '$app/paths';

	// Shared top bar, rendered on every route via +layout.svelte.
	// This component currently takes no props. Auth state (isLoggedIn, userType) will be
	// added as a Props contract here to drive the Sign in / Register button variants
	// (the Figma Header has logged-in/out and help-seeker/helper variants).
</script>

<header class="flex h-[106px] w-full items-center justify-between border-b border-gray-200 px-8">
	<a href={resolve('/')} class="flex items-center gap-3">
		<img src="/home/logo.svg" alt="" class="h-10 w-10" />
		<span class="text-xl font-semibold text-gray-800">Match Valencia</span>
	</a>

	<nav class="flex items-center gap-3">
		<a
			href={resolve('/login')}
			class="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
		>
			Sign in
		</a>
		<a
			href={resolve('/signup')}
			class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
		>
			Register
		</a>
	</nav>
</header>
