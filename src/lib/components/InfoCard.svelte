<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		description: string;
		author?: string;
	}

	let { title, subtitle, description, author }: Props = $props();

	const imgSrc =
		'https://images.unsplash.com/photo-1463171515643-952cee54d42a?q=80&w=450&h=190&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
</script>

<div
	class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition hover:shadow-xl"
>
	<header>
		<img src={imgSrc} alt="banner" class="aspect-[21/9] w-full object-cover grayscale" />
	</header>

	<article class="space-y-3 p-5">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
			>
				<span class="text-xl">📌</span>
			</div>
			<div>
				<p class="text-sm font-medium text-gray-500">{subtitle}</p>
				<h3 class="text-lg font-semibold text-gray-800">{title}</h3>
			</div>
		</div>
		<p class="text-gray-600">{description}</p>
	</article>

	<footer class="flex justify-between border-t px-5 py-4 text-sm text-gray-500">
		<span>By {author}</span>
		<span>{new Date().toLocaleDateString()}</span>
	</footer>
</div>
