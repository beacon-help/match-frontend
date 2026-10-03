export type TaskStats = {
	total: number;
	successful: number;
	in_progress: number;
};

export type UserStats = {
	total_helpers: number;
	total_help_seekers: number;
};

export type Stats = {
	tasks: TaskStats;
	users: UserStats;
};
