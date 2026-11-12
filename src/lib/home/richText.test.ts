import { describe, expect, it } from 'vitest';
import { spans } from './richText';

describe('spans', () => {
	it('returns plain text as a single non-bold span', () => {
		expect(spans('Hello there')).toEqual([{ text: 'Hello there', strong: false }]);
	});

	it('marks the phrases between double asterisks as bold', () => {
		expect(spans('in **Torrent** and **Alzira**.')).toEqual([
			{ text: 'in ', strong: false },
			{ text: 'Torrent', strong: true },
			{ text: ' and ', strong: false },
			{ text: 'Alzira', strong: true },
			{ text: '.', strong: false }
		]);
	});

	it('drops empty spans when the text starts or ends with bold', () => {
		expect(spans('**Bold** end')).toEqual([
			{ text: 'Bold', strong: true },
			{ text: ' end', strong: false }
		]);
	});
});
