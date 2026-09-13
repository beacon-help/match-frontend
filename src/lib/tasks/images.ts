import { env } from '$env/dynamic/public';

/**
 * Resolves a `TaskImage.path` into something usable as an `<img src>`.
 *
 * The backend builds `path` as an absolute URL, so that case is a pass-through; the
 * relative branch is only a fallback in case that ever changes. `GET /task/images/{id}`
 * takes no auth, so these load without headers.
 */
export function imageSrc(path: string): string {
	if (/^https?:\/\//i.test(path)) {
		return path;
	}
	return `${env.PUBLIC_API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
