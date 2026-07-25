import { PUBLIC_API_BASE_URL } from '$env/static/public';

export type ValidationError = {
	loc: (string | number)[];
	msg: string;
	type: string;
};

export type HTTPValidationError = {
	detail: ValidationError[];
};

export class ApiError extends Error {
	readonly status: number;
	readonly detail?: ValidationError[];

	constructor(message: string, status: number, detail?: ValidationError[]) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.detail = detail;
	}
}

export type ApiFetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
	signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
			method: options.method ?? 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...options.headers
			},
			body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
			signal: options.signal
		});
	} catch {
		throw new ApiError('Network error', 0);
	}

	if (!response.ok) {
		if (response.status === 422) {
			const body: HTTPValidationError = await response.json();
			throw new ApiError('Validation failed', response.status, body.detail);
		}
		throw new ApiError(`Request failed with status ${response.status}`, response.status);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json();
}

export function describeApiError(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 0) {
			return 'Unable to reach the server, check your connection.';
		}
		if (err.status === 422 && err.detail?.length) {
			return err.detail.map((d) => d.msg).join(' ');
		}
		return 'Something went wrong, please try again.';
	}
	return 'Something went wrong, please try again.';
}
