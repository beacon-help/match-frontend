import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// $env/dynamic/public is normally populated by the server on each request; jsdom tests
// never go through that request cycle, so read the same .env.test value Vite already
// loaded into process.env.
vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL }
}));

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	enumerable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// add more mocks here if you need them
