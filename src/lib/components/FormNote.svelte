<script lang="ts">
	import type { Note, NoteTone } from '$lib/types/note';

	interface Props {
		note: Note | null;
	}

	let { note }: Props = $props();

	const toneClasses: Record<NoteTone, string> = {
		muted: 'text-ink-soft',
		dirty: 'font-semibold text-wait',
		error: 'font-semibold text-danger',
		ok: 'font-semibold text-ok'
	};
</script>

<span role="status" class={['mr-auto text-base', note && toneClasses[note.tone]]}>{note?.text}</span
>
