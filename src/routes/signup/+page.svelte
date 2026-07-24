<script lang="ts">
	import SignupForm from '$lib/components/SignupForm.svelte';

	let signup = $state({
		firstName: '',
		lastName: '',
		email: '',
		password: ''
	});
</script>

<section class="container mx-auto px-4 py-10">
	<h3 class="mb-6 text-4xl font-bold">Sign up</h3>

	<SignupForm {signup} />
</section>
