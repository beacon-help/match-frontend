import config from 'virtual:match-config';

export const UNAVAILABLE_PATH = '/unavailable';

export async function isServerUp(): Promise<boolean> {
	try {
		const response = await fetch(`${config.api_base_url}/health`);
		return response.ok;
	} catch {
		return false;
	}
}

// Only same-site paths, so `?from=` can't send people to another site.
export function safeReturnPath(from: string | null): string {
	if (!from || !from.startsWith('/') || from.startsWith('//')) return '/';
	if (from.startsWith(UNAVAILABLE_PATH)) return '/';
	return from;
}

let checking = false;

// Several requests usually fail together; one health check answers for all of them.
export async function shouldShowUnavailable(pathname: string): Promise<boolean> {
	if (checking || pathname.startsWith(UNAVAILABLE_PATH)) return false;
	checking = true;
	try {
		return !(await isServerUp());
	} finally {
		checking = false;
	}
}
