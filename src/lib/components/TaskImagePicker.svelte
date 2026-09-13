<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { TaskImage } from '$lib/types/task';
	import { imageSrc } from '$lib/tasks/images';
	import {
		ACCEPT_ATTRIBUTE,
		LIMIT_LABEL,
		MAX_IMAGES,
		TYPE_LABEL,
		prepareImages
	} from '$lib/tasks/imagePrepare';

	interface Props {
		/** Photos the task already has on the server. */
		existing?: TaskImage[];
		/** Newly picked files, not yet uploaded. */
		pending: File[];
		/** Ids of existing photos the user wants gone. */
		removedIds?: string[];
		disabled?: boolean;
	}

	let {
		existing = [],
		pending = $bindable([]),
		removedIds = $bindable([]),
		disabled = false
	}: Props = $props();

	let errors = $state<string[]>([]);
	let isPreparing = $state(false);

	const kept = $derived(existing.filter((image) => !removedIds.includes(image.id)));
	const total = $derived(kept.length + pending.length);
	const isFull = $derived(total >= MAX_IMAGES);
	const isLocked = $derived(disabled || isPreparing);
	const addLabel = $derived(isPreparing ? 'Adding…' : 'Add photo');

	// Object URLs have to be handed back explicitly, so each pending file's preview is
	// cached here and revoked once that file is gone.
	const previews = new Map<File, string>();

	function previewUrl(file: File): string {
		let url = previews.get(file);
		if (!url) {
			url = URL.createObjectURL(file);
			previews.set(file, url);
		}
		return url;
	}

	// Files leave `pending` either through the remove button or because the parent cleared
	// the list after a successful upload, so the prune watches the list rather than living
	// in the remove handler.
	$effect(() => {
		const live = new Set(pending);
		for (const [file, url] of previews) {
			if (!live.has(file)) {
				URL.revokeObjectURL(url);
				previews.delete(file);
			}
		}
	});

	onDestroy(() => {
		for (const url of previews.values()) {
			URL.revokeObjectURL(url);
		}
		previews.clear();
	});

	async function handleSelection(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const selected = Array.from(input.files ?? []);
		// Clearing the input lets the same file be picked again after being removed.
		input.value = '';
		if (selected.length === 0) return;

		isPreparing = true;
		try {
			const result = await prepareImages(selected, total);
			pending = [...pending, ...result.files];
			errors = result.errors;
		} catch {
			// prepareImages is written not to throw, so this is belt and braces.
			errors = ['Those photos could not be read. Try picking them again.'];
		} finally {
			isPreparing = false;
		}
	}

	function removeExisting(id: string) {
		removedIds = [...removedIds, id];
		errors = [];
	}

	function removePending(file: File) {
		pending = pending.filter((candidate) => candidate !== file);
		errors = [];
	}
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="text-sm font-medium text-gray-700">Photos</legend>

	<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
		{#each kept as image, index (image.id)}
			<div class="group relative">
				<img
					src={imageSrc(image.path)}
					alt="Attachment {index + 1}"
					class="aspect-square w-full rounded-lg object-cover"
				/>
				<button
					type="button"
					{disabled}
					onclick={() => removeExisting(image.id)}
					aria-label="Remove attachment {index + 1}"
					class="absolute top-1 right-1 rounded-full bg-gray-900/70 px-2 py-0.5 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
				>
					×
				</button>
			</div>
		{/each}

		{#each pending as file (file)}
			<div class="relative">
				<img
					src={previewUrl(file)}
					alt={file.name}
					class="aspect-square w-full rounded-lg object-cover"
				/>
				<button
					type="button"
					{disabled}
					onclick={() => removePending(file)}
					aria-label="Remove {file.name}"
					class="absolute top-1 right-1 rounded-full bg-gray-900/70 px-2 py-0.5 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
				>
					×
				</button>
				<span
					class="absolute right-1 bottom-1 left-1 truncate rounded bg-gray-900/70 px-1 text-xs text-white"
				>
					{file.name}
				</span>
			</div>
		{/each}

		{#if !isFull}
			<!-- The input stays in the tab order (sr-only, not hidden) so the picker is
			     reachable by keyboard; the label is styled as the visible target. -->
			<label
				class="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 hover:border-blue-400 hover:text-blue-600 {isLocked
					? 'pointer-events-none opacity-50'
					: ''}"
			>
				<span class="text-xl" aria-hidden="true">+</span>
				<span>{addLabel}</span>
				<input
					type="file"
					multiple
					accept={ACCEPT_ATTRIBUTE}
					disabled={isLocked}
					onchange={handleSelection}
					aria-describedby="photo-hint"
					class="sr-only"
				/>
			</label>
		{/if}
	</div>

	<p id="photo-hint" class="text-xs text-gray-500">
		{total} of {MAX_IMAGES} photos · {TYPE_LABEL}, up to {LIMIT_LABEL} each
	</p>

	<div role="alert" class="flex flex-col gap-1">
		{#each errors as message}
			<p class="text-sm text-red-600">{message}</p>
		{/each}
	</div>
</fieldset>
