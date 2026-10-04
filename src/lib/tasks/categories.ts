import config from 'virtual:match-config';

export const CATEGORIES = config.task_categories;

// A value no longer in the config still shows, just without a nicer label.
export function categoryLabel(value: string): string {
	return CATEGORIES.find((category) => category.value === value)?.label ?? value;
}
