/**
 * Client-side preparation of user-picked photos before they are uploaded to a task.
 *
 * The backend declares no limits of its own, so these are ours: they keep uploads small
 * enough to succeed and give the user an error at pick time rather than after a failed
 * request.
 */

/** Most photos a single task may carry. */
export const MAX_IMAGES = 5;

/** Largest file we accept, measured on the file as picked. */
export const MAX_BYTES = 5 * 1024 * 1024;

/** Longest edge we aim to upload; anything larger is scaled down to fit. */
export const MAX_DIMENSION = 1600;

export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Ready-made `accept` value, so the file input doesn't restate the type policy. */
export const ACCEPT_ATTRIBUTE = ALLOWED_TYPES.join(',');

/** Human-readable form of ALLOWED_TYPES, for error text and picker hints. */
export const TYPE_LABEL = 'JPEG, PNG or WebP';

export type PreparedImages = {
	/** Files that passed validation, downscaled where possible. */
	files: File[];
	/** One user-facing message per rejected file, in the order they were picked. */
	errors: string[];
};

/** Rounds up, so a file a hair over the cap never reads as being exactly at the cap. */
function describeSize(bytes: number): string {
	return `${(Math.ceil((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)}MB`;
}

/** Human-readable form of MAX_BYTES, for error text and picker hints. */
export const LIMIT_LABEL = `${MAX_BYTES / (1024 * 1024)}MB`;

/**
 * Checks one file against the type and size limits.
 *
 * Size is judged on the original rather than the downscaled result, so the rule the user
 * sees matches the file they picked.
 */
export function validateImageFile(file: File): string | null {
	if (!ALLOWED_TYPES.includes(file.type)) {
		return `${file.name} is not a supported photo — use ${TYPE_LABEL}.`;
	}
	if (file.size > MAX_BYTES) {
		return `${file.name} is ${describeSize(file.size)} — the limit is ${LIMIT_LABEL} per photo.`;
	}
	return null;
}

/**
 * Dimensions that fit inside MAX_DIMENSION while preserving the aspect ratio. Images
 * already small enough are returned unchanged, and no edge is ever rounded away to zero.
 */
export function scaledDimensions(
	width: number,
	height: number
): { width: number; height: number; changed: boolean } {
	const longest = Math.max(width, height);
	if (longest <= MAX_DIMENSION || longest === 0) {
		return { width, height, changed: false };
	}
	const scale = MAX_DIMENSION / longest;
	return {
		width: Math.max(1, Math.round(width * scale)),
		height: Math.max(1, Math.round(height * scale)),
		changed: true
	};
}

/**
 * Shrinks an oversized photo in the browser to save bandwidth.
 *
 * Never throws: the original file is returned whenever downscaling isn't possible or isn't
 * worthwhile — outside a browser, on an undecodable file, when the image already fits,
 * when the canvas can't encode the source type, or when re-encoding came out no smaller
 * (common for PNG, whose encoder ignores the quality hint). In those last two cases the
 * upload keeps its original dimensions, so MAX_DIMENSION is a target rather than a
 * guarantee. Output keeps the source type, so transparency doesn't turn black.
 */
export async function downscaleImage(file: File): Promise<File> {
	if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
		return file;
	}

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		return file;
	}

	try {
		const target = scaledDimensions(bitmap.width, bitmap.height);
		if (!target.changed) {
			return file;
		}

		const canvas = document.createElement('canvas');
		canvas.width = target.width;
		canvas.height = target.height;
		const context = canvas.getContext('2d');
		if (!context) {
			return file;
		}
		context.drawImage(bitmap, 0, 0, target.width, target.height);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, file.type, 0.85)
		);
		// A canvas that can't encode the requested type silently falls back to PNG. Rather
		// than upload bytes that contradict their name and type, keep the original.
		if (!blob || blob.type !== file.type || blob.size >= file.size) {
			return file;
		}
		return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
	} catch {
		return file;
	} finally {
		try {
			bitmap.close();
		} catch {
			// Already released; nothing to reclaim.
		}
	}
}

/**
 * Validates and downscales a batch of freshly picked files.
 *
 * `existingCount` is how many photos the task already has once pending removals are taken
 * into account, so the cap applies to the end state rather than to this batch alone.
 */
export async function prepareImages(
	selected: File[],
	existingCount: number
): Promise<PreparedImages> {
	const files: File[] = [];
	const errors: string[] = [];
	let remaining = Math.max(0, MAX_IMAGES - existingCount);

	for (const file of selected) {
		const problem = validateImageFile(file);
		if (problem) {
			errors.push(problem);
			continue;
		}
		if (remaining === 0) {
			errors.push(`You can attach at most ${MAX_IMAGES} photos — ${file.name} was skipped.`);
			continue;
		}
		remaining -= 1;
		files.push(await downscaleImage(file));
	}

	return { files, errors };
}
