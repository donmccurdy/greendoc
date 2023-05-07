import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';
import type { InterfaceDeclaration } from 'ts-morph';

export const load: PageServerLoad<{ interface: GD.ApiInterface }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { interface: encoder.encodeItem(parser, item as InterfaceDeclaration) };
	throw error(404, 'Not found');
};
