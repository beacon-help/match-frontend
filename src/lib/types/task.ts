export type TaskStatus = 'open' | 'pending' | 'approved' | 'succeeded' | 'failed' | 'cancelled';

export type Location = {
	address: string;
	lat: number | string;
	lon: number | string;
};

export type PublicTask = {
	id: number;
	title: string;
	status: TaskStatus;
	location: Location;
	category: string;
};
