export const CATEGORIES = [
	'transport people',
	'food',
	'accommodation',
	'clothes',
	'medical help',
	'clean',
	'repair',
	'other'
] as const;

export type Category = (typeof CATEGORIES)[number];
