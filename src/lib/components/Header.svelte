<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { session, endSession } from '$lib/auth/session.svelte';
	import type { UserSchema, UserType } from '$lib/api/user';
	import NavLink from '$lib/components/NavLink.svelte';

	function shortName(user: UserSchema): string {
		return `${user.first_name} ${user.last_name.charAt(0).toUpperCase()}.`;
	}

	function initials(user: UserSchema): string {
		return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
	}

	const ROLE_LABEL: Record<UserType, string> = {
		'help-seeker': 'Help seeker',
		volunteer: 'Volunteer'
	};

	let menuOpen = $state(false);

	const path = $derived(page.url.pathname);

	async function logout() {
		menuOpen = false;
		endSession();
		await goto(resolve('/'));
	}
</script>

<header class="border-b border-line">
	<div
		class="mx-auto flex min-h-14 w-full max-w-5xl items-stretch justify-between gap-3 px-4 sm:min-h-16 sm:px-6"
	>
		<a href={resolve('/')} class="flex items-center gap-3 text-xl whitespace-nowrap text-ink">
			<span><b class="font-bold">Match</b> <span class="max-sm:hidden">Valencia</span></span>
			{#if session.user && session.role}
				<span class="hidden border-l border-line pl-3 text-base text-ink-soft sm:inline">
					{ROLE_LABEL[session.role]}
				</span>
			{/if}
		</a>

		{#if session.user}
			<nav class="flex items-stretch gap-1">
				{#if session.role === 'volunteer'}
					<NavLink href={resolve('/tasks/search')} current={path === resolve('/tasks/search')}>
						Find a task
					</NavLink>
				{:else}
					<NavLink href={resolve('/tasks/create')} current={path === resolve('/tasks/create')}>
						Ask for help
					</NavLink>
				{/if}
				<NavLink href={resolve('/tasks')} current={path === resolve('/tasks')}>My tasks</NavLink>

				<div class="relative flex items-stretch">
					<button
						type="button"
						onclick={() => (menuOpen = !menuOpen)}
						class="flex items-center gap-1.5 px-2 text-base whitespace-nowrap text-ink-soft hover:text-ink sm:pl-3.5"
						aria-label="Your account"
						aria-haspopup="menu"
						aria-expanded={menuOpen}
					>
						<span class="sm:hidden">{initials(session.user)}</span>
						<span class="max-sm:hidden">{shortName(session.user)}</span>
						<svg
							class="h-4 w-4"
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
							class="absolute top-full right-0 z-20 w-44 border border-line bg-white py-1 shadow-md"
							role="menu"
						>
							<a
								href={resolve('/me')}
								onclick={() => (menuOpen = false)}
								class="block px-4 py-2.5 text-base text-ink hover:bg-fill"
								role="menuitem"
							>
								Your profile
							</a>
							<button
								type="button"
								onclick={logout}
								class="block w-full px-4 py-2.5 text-left text-base text-ink hover:bg-fill"
								role="menuitem"
							>
								Log out
							</button>
						</div>
					{/if}
				</div>
			</nav>
		{:else}
			<nav class="flex items-stretch gap-1">
				<NavLink href={resolve('/mission')} current={path === resolve('/mission')}>Mission</NavLink>
				<NavLink href={resolve('/login')} current={path === resolve('/login')}>Sign in</NavLink>
				<NavLink href={resolve('/signup')} current={path === resolve('/signup')}>Register</NavLink>
			</nav>
		{/if}
	</div>
</header>
