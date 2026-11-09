import { tick } from 'svelte';

/** Waits for the errors to render, then focuses the first field marked invalid. */
export async function focusFirstInvalid(form: HTMLFormElement): Promise<void> {
	await tick();
	form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
}
