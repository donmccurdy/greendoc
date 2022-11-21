import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ApiClass } from '@microsoft/api-extractor-model';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';

export const load: PageServerLoad<{ class: GD.ApiClass }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { class: encoder.encodeItem(parser, item as ApiClass) };
	throw error(404, 'Not found');
};
