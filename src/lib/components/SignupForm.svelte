<script lang="ts">
	type Signup = {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	};

	interface Props {
		signup: Signup;
	}

	let { signup }: Props = $props();
</script>

<div class="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
	<h2 class="mb-4 text-2xl font-bold text-gray-800">Create your account</h2>

	<div class="space-y-4">
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="first-name"
					>First name</label
				>
				<input
					id="first-name"
					type="text"
					bind:value={signup.firstName}
					placeholder="e.g. Alex"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label class="mb-1 block text-sm font-medium text-gray-700" for="last-name">Last name</label
				>
				<input
					id="last-name"
					type="text"
					bind:value={signup.lastName}
					placeholder="e.g. Johnson"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="email">Email</label>
			<input
				id="email"
				type="email"
				bind:value={signup.email}
				placeholder="e.g. alex@example.com"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>

		<div>
			<label class="mb-1 block text-sm font-medium text-gray-700" for="password">Password</label>
			<input
				id="password"
				type="password"
				bind:value={signup.password}
				placeholder="At least 8 characters"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
	</div>
</div>
