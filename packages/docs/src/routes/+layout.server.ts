import type { LayoutServerLoad } from './$types';
import { parser } from '$lib/server/model';
import type { Node } from 'ts-morph';

export const prerender = true;

const parseExports = parser
	.getModuleExports('@greendoc/parse')
	.map(createExport)
	.sort((a: Export, b: Export) => (a.text > b.text ? 1 : -1));

interface Export {
	text: string;
	href: string;
	kind: string;
	category?: string;
	external?: boolean;
}

interface Section {
	title: string;
	items?: Export[];
	subsections?: Subsection[];
}

interface Subsection {
	title: string;
	items?: Export[];
}

function createExport(item: Node): Export {
	return {
		text: parser.getName(item),
		href: parser.getPath(item)!,
		kind: item.getKindName(),
		category: parser.getTag(item, 'category') || undefined
	};
}

export const load: LayoutServerLoad = () => {
	return {
		metadata: {
			title: 'greendoc',
			snippet: ''
		},
		navigation: {
			sections: [
				{
					title: 'Getting Started',
					items: [
						{ text: 'Home', href: '/' },
						{ text: 'Installation', href: '/installation' },
						{
							text: 'GitHub',
							external: true,
							href: 'https://github.com/donmccurdy/greendoc'
						},
						{
							text: 'NPM',
							external: true,
							href: 'https://www.npmjs.com/search?q=%40greendoc'
						}
					],
					subsections: []
				},
				{
					title: '@greendoc/parse',
					items: parseExports
				}
			] as Section[]
		}
	};
};
