<script lang="ts">
	import { resolve } from '$app/paths';

	// Shared top bar, rendered on every route via +layout.svelte.
	// This component currently takes no props. Auth state (isLoggedIn, userType) will be
	// added as a Props contract here to drive the Sign in / Register button variants
	// (the Figma Header has logged-in/out and help-seeker/helper variants).
</script>

<header
	class="flex h-[106px] w-full items-center justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 lg:px-8"
>
	<a href={resolve('/')} class="flex items-center gap-2 sm:gap-3">
		<img src="/home/logo.svg" alt="" class="h-9 w-9 sm:h-10 sm:w-10" />
		<span class="text-lg font-semibold whitespace-nowrap text-gray-800 sm:text-xl">
			Match Valencia
		</span>
	</a>

	<nav class="flex items-center gap-2 sm:gap-3">
		<a
			href={resolve('/login')}
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:bg-gray-50 sm:px-4 sm:text-base"
		>
			Sign in
		</a>
		<a
			href={resolve('/signup')}
			class="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-blue-700 sm:px-4 sm:text-base"
		>
			Register
		</a>
	</nav>
</header>
