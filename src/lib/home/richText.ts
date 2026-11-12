export type Span = { text: string; strong: boolean };

// Config copy marks bold phrases with **double asterisks**.
export function spans(source: string): Span[] {
	return source
		.split('**')
		.map((text, i) => ({ text, strong: i % 2 === 1 }))
		.filter((span) => span.text !== '');
}
