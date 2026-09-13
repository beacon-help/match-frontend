import { describe, it, expect } from 'vitest';
import {
	ACCEPT_ATTRIBUTE,
	MAX_BYTES,
	MAX_DIMENSION,
	MAX_IMAGES,
	downscaleImage,
	prepareImages,
	scaledDimensions,
	validateImageFile
} from './imagePrepare';

function fakeFile(name: string, type: string, size = 1024): File {
	const file = new File(['x'], name, { type });
	// Size is derived from the contents, so it has to be forced for the limit tests.
	Object.defineProperty(file, 'size', { value: size });
	return file;
}

describe('validateImageFile', () => {
	it('accepts a jpeg within the size limit', () => {
		expect(validateImageFile(fakeFile('photo.jpg', 'image/jpeg'))).toBeNull();
	});

	it('accepts png and webp', () => {
		expect(validateImageFile(fakeFile('a.png', 'image/png'))).toBeNull();
		expect(validateImageFile(fakeFile('a.webp', 'image/webp'))).toBeNull();
	});

	it('rejects a non-image type and names the file', () => {
		const error = validateImageFile(fakeFile('notes.pdf', 'application/pdf'));

		expect(error).toContain('notes.pdf');
		expect(error).toContain('JPEG, PNG or WebP');
	});

	it('rejects a gif, which the upload flow does not cover', () => {
		expect(validateImageFile(fakeFile('loop.gif', 'image/gif'))).not.toBeNull();
	});

	it('rejects a file with no type at all', () => {
		expect(validateImageFile(fakeFile('mystery', ''))).not.toBeNull();
	});

	it('reports the actual size of a file over the limit', () => {
		const error = validateImageFile(fakeFile('huge.jpg', 'image/jpeg', 8.4 * 1024 * 1024));

		expect(error).toBe('huge.jpg is 8.4MB — the limit is 5MB per photo.');
	});

	it('never reports an over-limit file as being exactly at the limit', () => {
		const error = validateImageFile(fakeFile('edge.jpg', 'image/jpeg', MAX_BYTES + 1));

		// Rounding down here would read "is 5.0MB — the limit is 5MB", which contradicts itself.
		expect(error).toBe('edge.jpg is 5.1MB — the limit is 5MB per photo.');
	});

	it('accepts a file exactly at the size limit', () => {
		expect(validateImageFile(fakeFile('edge.jpg', 'image/jpeg', MAX_BYTES))).toBeNull();
	});
});

describe('ACCEPT_ATTRIBUTE', () => {
	it('lists every allowed type for the file input', () => {
		expect(ACCEPT_ATTRIBUTE).toBe('image/jpeg,image/png,image/webp');
	});
});

describe('scaledDimensions', () => {
	it('leaves an image that already fits untouched', () => {
		expect(scaledDimensions(800, 600)).toEqual({ width: 800, height: 600, changed: false });
	});

	it('leaves an image exactly at the limit untouched', () => {
		expect(scaledDimensions(MAX_DIMENSION, 900)).toMatchObject({ changed: false });
	});

	it('scales an image one pixel over the limit', () => {
		expect(scaledDimensions(MAX_DIMENSION + 1, MAX_DIMENSION + 1)).toMatchObject({
			width: MAX_DIMENSION,
			changed: true
		});
	});

	it('scales a landscape image by its longest edge', () => {
		expect(scaledDimensions(3200, 2400)).toEqual({
			width: MAX_DIMENSION,
			height: 1200,
			changed: true
		});
	});

	it('scales a portrait image by its longest edge', () => {
		expect(scaledDimensions(2400, 3200)).toEqual({
			width: 1200,
			height: MAX_DIMENSION,
			changed: true
		});
	});

	it('never rounds an extreme aspect ratio down to a zero edge', () => {
		// A zero-height canvas encodes to nothing, losing the image entirely.
		expect(scaledDimensions(10000, 1)).toEqual({ width: MAX_DIMENSION, height: 1, changed: true });
	});

	it('does not divide by zero on an empty image', () => {
		expect(scaledDimensions(0, 0)).toEqual({ width: 0, height: 0, changed: false });
	});
});

describe('downscaleImage', () => {
	// These tests run in the node project, so there is no canvas to downscale with. That
	// fallback is what lets prepareImages be tested here at all, so it is pinned directly.
	it('returns the original file when there is no browser to downscale in', async () => {
		const file = fakeFile('a.jpg', 'image/jpeg');

		expect(await downscaleImage(file)).toBe(file);
	});
});

describe('prepareImages', () => {
	it('keeps every valid file when under the cap', async () => {
		const picked = [fakeFile('a.jpg', 'image/jpeg'), fakeFile('b.png', 'image/png')];

		const result = await prepareImages(picked, 0);

		expect(result.files).toHaveLength(2);
		expect(result.errors).toEqual([]);
	});

	it('returns nothing for an empty selection', async () => {
		expect(await prepareImages([], 0)).toEqual({ files: [], errors: [] });
	});

	it('separates invalid files out into errors', async () => {
		const picked = [fakeFile('good.jpg', 'image/jpeg'), fakeFile('bad.pdf', 'application/pdf')];

		const result = await prepareImages(picked, 0);

		expect(result.files.map((f) => f.name)).toEqual(['good.jpg']);
		expect(result.errors).toHaveLength(1);
	});

	it('caps the batch against images the task already has', async () => {
		const picked = [fakeFile('a.jpg', 'image/jpeg'), fakeFile('b.jpg', 'image/jpeg')];

		const result = await prepareImages(picked, MAX_IMAGES - 1);

		expect(result.files.map((f) => f.name)).toEqual(['a.jpg']);
		expect(result.errors[0]).toContain('b.jpg');
		expect(result.errors[0]).toContain(String(MAX_IMAGES));
	});

	it('rejects everything once the task is already full', async () => {
		const result = await prepareImages([fakeFile('a.jpg', 'image/jpeg')], MAX_IMAGES);

		expect(result.files).toEqual([]);
		expect(result.errors).toHaveLength(1);
	});

	it('rejects everything when the existing count somehow exceeds the cap', async () => {
		const result = await prepareImages([fakeFile('a.jpg', 'image/jpeg')], MAX_IMAGES + 2);

		expect(result.files).toEqual([]);
		expect(result.errors).toHaveLength(1);
	});

	it('does not let an invalid file consume a slot', async () => {
		const picked = [
			fakeFile('bad.pdf', 'application/pdf'),
			fakeFile('a.jpg', 'image/jpeg'),
			fakeFile('b.jpg', 'image/jpeg')
		];

		const result = await prepareImages(picked, MAX_IMAGES - 2);

		expect(result.files.map((f) => f.name)).toEqual(['a.jpg', 'b.jpg']);
		expect(result.errors).toHaveLength(1);
	});

	it('reports mixed rejection reasons in the order the files were picked', async () => {
		const picked = [
			fakeFile('a.jpg', 'image/jpeg'),
			fakeFile('bad.pdf', 'application/pdf'),
			fakeFile('over.jpg', 'image/jpeg')
		];

		const result = await prepareImages(picked, MAX_IMAGES - 1);

		expect(result.files.map((f) => f.name)).toEqual(['a.jpg']);
		expect(result.errors[0]).toContain('bad.pdf');
		expect(result.errors[1]).toContain('over.jpg');
	});
});
