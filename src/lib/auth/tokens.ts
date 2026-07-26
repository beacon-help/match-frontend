import { browser } from '$app/environment';
import type { TokenSchema } from '$lib/api/user';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function saveTokens(tokens: TokenSchema): void {
	if (!browser) return;
	localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
	localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
}

export function getAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearTokens(): void {
	if (!browser) return;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}
