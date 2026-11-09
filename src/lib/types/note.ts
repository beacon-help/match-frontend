export type NoteTone = 'muted' | 'dirty' | 'error' | 'ok';

export type Note = {
	text: string;
	tone: NoteTone;
};
