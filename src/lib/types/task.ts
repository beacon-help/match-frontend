import type { Category } from '$lib/tasks/categories';

export type TaskStatus = 'open' | 'pending' | 'approved' | 'succeeded' | 'failed' | 'cancelled';

export type TaskAction =
	'join' | 'approve' | 'reject' | 'close' | 'report_success' | 'report_failure';

// The OpenAPI schema says `anyOf: [number, string]`, but the string branch is a Decimal
// artifact of pydantic accepting lenient input — responses always carry JSON numbers.
export type Location = {
	address: string;
	lat: number;
	lon: number;
};

export interface BaseTask {
	id: number;
	title: string;
	status: TaskStatus;
	location: Location;
	category: Category;
}

export type PublicTask = BaseTask;

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
