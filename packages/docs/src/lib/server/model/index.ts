import { Encoder, GD, Parser } from '@greendoc/parse';
import { Project } from 'ts-morph';
import he from 'he';

const BASE = new URL('../../../../../../', import.meta.url).pathname.replace(/\/$/, '');

const entryPath = `${BASE}/packages/parse/src/index.ts`;

const project = new Project({
	compilerOptions: {
		paths: {
			'@greendoc/parse': [entryPath]
		}
	}
});

export const parser = new Parser(project)
	.addModule({ name: '@greendoc/parse', slug: 'parse', entry: entryPath })
	.setRootPath(BASE)
	.setBaseURL('https://github.com/donmccurdy/greendoc/tree/main')
	.init();

export const encoder = new Encoder();

export function getMetadata(item: GD.ApiClass | GD.ApiInterface | GD.ApiEnum | GD.ApiFunction): {
	title: string;
	snippet: string;
} {
	return {
		title: item.name,
		snippet: item.comment ? getSnippet(item.comment) : ''
	};
}

export function getSnippet(html: string): string {
	const text = he.decode(html.replace(/(<([^>]+)>)/gi, ''));
	const words = text.split(/\s+/);
	if (words.length < 50) return text;
	return words.slice(0, 50).join(' ') + '…';
}
