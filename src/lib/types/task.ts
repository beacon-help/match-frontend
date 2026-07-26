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
	category: string;
}

export interface PublicTask extends BaseTask {}

export interface TaskUser {
	id: number;
	first_name: string;
}

export interface Task extends BaseTask {
	description: string;
	created_at: string;
	updated_at: string | null;
	owner: TaskUser;
	helper: TaskUser | null;
}
