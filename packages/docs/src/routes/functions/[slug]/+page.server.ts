import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';
import type { ClassDeclaration, FunctionDeclaration } from 'ts-morph';

export const load: PageServerLoad<{ class: GD.ApiFunction }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { class: encoder.encodeItem(parser, item as FunctionDeclaration) };
	throw error(404, 'Not found');
};
