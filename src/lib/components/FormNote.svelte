<script lang="ts">
	import type { Note, NoteTone } from '$lib/types/note';

	interface Props {
		note: Note | null;
	}

	let { note }: Props = $props();

	const toneClasses: Record<NoteTone, string> = {
		muted: 'text-gray-500',
		dirty: 'font-medium text-amber-700',
		error: 'font-medium text-red-600',
		ok: 'font-medium text-green-700'
	};
</script>

<span role="status" class={['mr-auto text-sm', note && toneClasses[note.tone]]}>{note?.text}</span>
