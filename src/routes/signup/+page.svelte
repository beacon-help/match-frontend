<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<section class="container mx-auto px-4 py-10">
	<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
		<h2 class="mb-8 text-center text-3xl font-bold text-gray-800">
			Tell us why do you want to register?
		</h2>

		<div class="flex flex-col gap-4 sm:flex-row">
			<a
				href={resolve('/signup/helpseeker')}
				class="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center text-lg font-semibold text-gray-900 transition hover:border-blue-500 hover:bg-blue-50"
			>
				I need help
			</a>
			<a
				href={resolve('/signup/volunteer')}
				class="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-6 py-8 text-center text-lg font-semibold text-gray-900 transition hover:border-blue-500 hover:bg-blue-50"
			>
				I want to help
			</a>
		</div>
	</div>
</section>
