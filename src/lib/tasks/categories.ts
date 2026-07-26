// `category` is a free string on the backend, and the Figma frames are inconsistent (search
// shows Transport People/Goods, Donation, Medical Help, Clean & Repair; create shows
// Accommodation, Clothes, Lost, Food, Transportation). We define ONE canonical list here and
// use it everywhere (Search filter, Create, Edit) so the taxonomy stays consistent.
export const CATEGORIES = [
	'Transport People',
	'Transport Goods',
	'Food',
	'Clothes',
	'Accommodation',
	'Medical Help',
	'Clean & Repair',
	'Donation',
	'Lost & Found'
] as const;

export type Category = (typeof CATEGORIES)[number];
