import { describe, it, expect } from 'vitest';
import { imageSrc } from './images';

// .env.test sets PUBLIC_API_BASE_URL=http://localhost:8000
describe('imageSrc', () => {
	it('passes an absolute URL through untouched', () => {
		expect(imageSrc('http://localhost:8000/task/images/abc')).toBe(
			'http://localhost:8000/task/images/abc'
		);
	});

	it('passes an https URL through untouched', () => {
		expect(imageSrc('https://cdn.example.com/abc.jpg')).toBe('https://cdn.example.com/abc.jpg');
	});

	it('prefixes the API base onto a rooted path', () => {
		expect(imageSrc('/task/images/abc')).toBe('http://localhost:8000/task/images/abc');
	});

	it('inserts the separator when the path is not rooted', () => {
		expect(imageSrc('task/images/abc')).toBe('http://localhost:8000/task/images/abc');
	});
});
