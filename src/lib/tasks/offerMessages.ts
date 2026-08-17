// TODO: backend — there is no offer/review message field on the task schema yet, so a
// volunteer's "Offer help" message is mock-persisted in localStorage keyed by task id. The
// help-seeker's Review Request modal reads it back from here. Replace with a real field once
// the backend supports messages.
const KEY = 'match:offer-messages';

type MessageMap = Record<string, string>;

function read(): MessageMap {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
}

export function saveOfferMessage(taskId: number, message: string): void {
	if (typeof localStorage === 'undefined') return;
	const map = read();
	map[String(taskId)] = message;
	localStorage.setItem(KEY, JSON.stringify(map));
}

export function getOfferMessage(taskId: number): string | null {
	return read()[String(taskId)] ?? null;
}
