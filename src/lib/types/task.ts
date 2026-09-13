import type { Category } from '$lib/tasks/categories';

export type TaskStatus = 'open' | 'pending' | 'approved' | 'succeeded' | 'failed' | 'cancelled';

export type TaskAction =
	'join' | 'approve' | 'reject' | 'close' | 'report_success' | 'report_failure';

export type Location = {
	address: string;
	lat: number | string;
	lon: number | string;
};

export interface BaseTask {
	id: number;
	title: string;
	status: TaskStatus;
	location: Location;
	category: Category;
}

export interface PublicTask extends BaseTask {}

export interface TaskUser {
	id: number;
	first_name: string;
}

export interface HelperOffer {
	user_id: number;
	offered_at: string;
	message: string;
}

export interface TaskImage {
	id: string;
	/** Absolute URL served by the API — render it via `imageSrc()`. */
	path: string;
}

export interface Task extends BaseTask {
	description: string;
	created_at: string;
	updated_at: string | null;
	owner: TaskUser;
	helper: TaskUser | null;
	helper_offers: HelperOffer[];
	images: TaskImage[];
}

export type TaskCreationRequest = {
	title: string;
	description: string;
	category: string;
	location: Location;
};
