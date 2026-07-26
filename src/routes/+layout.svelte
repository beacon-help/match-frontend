<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import { loadSession } from '$lib/auth/session.svelte';

	onMount(loadSession);
</script>

<Header />
<slot />
