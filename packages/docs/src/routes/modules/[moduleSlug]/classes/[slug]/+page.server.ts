import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';
import type { ClassDeclaration } from 'ts-morph';

export const load: PageServerLoad<{ export: GD.ApiClass }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { export: encoder.encodeItem(parser, item as ClassDeclaration) };
	throw error(404, 'Not found');
};
