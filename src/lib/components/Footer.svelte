<script lang="ts">
	import config from 'virtual:match-config';
	import { resolve } from '$app/paths';
</script>

<footer class="border-t border-line text-base text-ink-soft">
	<div
		class="mx-auto flex w-full max-w-5xl flex-wrap justify-between gap-x-10 gap-y-1 px-4 pt-5 pb-8 sm:px-6"
	>
		<p>
			Match Valencia ·
			<a
				href={resolve('/mission')}
				class="inline-block py-2 text-navy underline hover:text-navy-dark">Mission</a
			>
		</p>
		<p>
			Questions or want to partner with us?
			<a
				href="mailto:{config.contact_email}"
				class="inline-block py-2 text-navy underline hover:text-navy-dark">{config.contact_email}</a
			>
		</p>
	</div>
</footer>
