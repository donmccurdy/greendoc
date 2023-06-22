import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Encoder, GD, Parser } from '@greendoc/parse';
import * as TS from 'ts-morph';
import he from 'he';

const ROOT_DELTA = '../../../../../../';
const ROOT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), ROOT_DELTA);

const entryPath = resolve(ROOT_PATH, 'packages/parse/src/index.ts');

const project = new TS.Project({
	compilerOptions: {
		paths: {
			'@greendoc/parse': [entryPath]
		}
	}
});

export const parser = new Parser(project)
	.addModule({ name: '@greendoc/parse', slug: 'parse', entry: entryPath })
	.setRootPath(ROOT_PATH)
	.setBaseURL('https://github.com/donmccurdy/greendoc/tree/main')
	.init();

export const encoder = new Encoder();

export function getMetadata(item: GD.ApiItem): {
	title: string;
	snippet: string;
} {
	return {
		title: item.name,
		snippet: (item as any).comment ? getSnippet((item as any).comment) : ''
	};
}

export function getSnippet(html: string): string {
	const text = he.decode(html.replace(/(<([^>]+)>)/gi, ''));
	const words = text.split(/\s+/);
	if (words.length < 50) return text;
	return words.slice(0, 50).join(' ') + '…';
}
