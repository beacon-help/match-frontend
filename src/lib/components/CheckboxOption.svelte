<script lang="ts">
	interface Props {
		label: string;
		checked: boolean;
		onchange: () => void;
	}

	let { label, checked, onchange }: Props = $props();
</script>

<label class="flex min-h-11 cursor-pointer items-center gap-3">
	<input type="checkbox" {checked} {onchange} class="h-5 w-5 shrink-0 accent-navy" />
	{label}
</label>
