<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { session, endSession } from '$lib/auth/session.svelte';
	import type { UserSchema, UserType } from '$lib/api/user';

	function initials(user: UserSchema): string {
		return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
	}

	const ROLE_LABEL: Record<UserType, string> = {
		'help-seeker': 'Help Seeker',
		volunteer: 'Volunteer'
	};

	let menuOpen = $state(false);

	async function logout() {
		menuOpen = false;
		endSession();
		await goto(resolve('/'));
	}
</script>

<header
	class="flex h-[106px] w-full items-center justify-between gap-4 border-b border-gray-200 px-4 sm:px-6 lg:px-8"
>
	<a href={resolve('/')} class="flex items-center gap-2 sm:gap-3">
		<img src="/home/logo.svg" alt="" class="h-9 w-9 sm:h-10 sm:w-10" />
		<span class="text-lg font-semibold whitespace-nowrap text-gray-800 sm:text-xl">
			Match Valencia
		</span>
		{#if session.user && session.role}
			<span class="hidden text-gray-300 sm:inline">|</span>
			<span class="hidden text-lg font-medium whitespace-nowrap text-gray-500 sm:inline">
				{ROLE_LABEL[session.role]}
			</span>
		{/if}
	</a>

	{#if session.user}
		<nav class="flex items-center gap-2 sm:gap-3">
			{#if session.role === 'volunteer'}
				<a
					href={resolve('/tasks/search')}
					class="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:bg-gray-50 sm:px-4 sm:text-base"
				>
					Search Task
				</a>
			{:else}
				<a
					href={resolve('/tasks/create')}
					class="rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-700 hover:bg-gray-50 sm:px-4 sm:text-base"
				>
					Create Task
				</a>
			{/if}
			<a
				href={resolve('/tasks')}
				class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium whitespace-nowrap text-gray-900 sm:px-4 sm:text-base"
			>
				My Tasks
			</a>

			<div class="relative">
				<button
					type="button"
					onclick={() => (menuOpen = !menuOpen)}
					class="ml-1 flex items-center gap-1.5 rounded-lg py-1 pr-2 pl-1 hover:bg-gray-50"
					aria-label="Your account"
					aria-haspopup="menu"
					aria-expanded={menuOpen}
				>
					<span
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
					>
						{initials(session.user)}
					</span>
					<svg
						class="h-4 w-4 text-gray-500"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						aria-hidden="true"
					>
						<path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>

				{#if menuOpen}
					<!-- Click-away backdrop; closes the menu on any outside interaction. -->
					<button
						type="button"
						class="fixed inset-0 z-10 cursor-default"
						aria-label="Close menu"
						onclick={() => (menuOpen = false)}
					></button>
					<div
						class="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
						role="menu"
					>
						<a
							href={resolve('/me')}
							onclick={() => (menuOpen = false)}
							class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
							role="menuitem"
						>
							Your profile
						</a>
						<button
							type="button"
							onclick={logout}
							class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
							role="menuitem"
						>
							Log out
						</button>
					</div>
				{/if}
			</div>
		</nav>
	{:else}
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
	{/if}
</header>
