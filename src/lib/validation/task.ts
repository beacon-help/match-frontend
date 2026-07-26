import type { TaskCreationRequest } from '$lib/types/task';

export type TaskErrors = Partial<Record<'title' | 'description' | 'category' | 'location', string>>;

export function validateTask(task: TaskCreationRequest): TaskErrors {
	const errors: TaskErrors = {};

	if (!task.title.trim()) {
		errors.title = 'Title is required.';
	}

	if (!task.description.trim()) {
		errors.description = 'Please describe your situation.';
	}

	if (!task.category.trim()) {
		errors.category = 'Pick a category.';
	}

	// A pin must be dropped (real coordinates) and an address typed.
	const hasCoords =
		Number.isFinite(Number(task.location.lat)) && Number.isFinite(Number(task.location.lon));
	if (!task.location.address.trim() || !hasCoords) {
		errors.location = 'Set a location by typing an address and dropping a pin on the map.';
	}

	return errors;
}
