import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ApiInterface } from '@microsoft/api-extractor-model';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';

export const load: PageServerLoad<{ interface: GD.ApiInterface }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { interface: encoder.encodeItem(parser, item as ApiInterface) };
	throw error(404, 'Not found');
};
