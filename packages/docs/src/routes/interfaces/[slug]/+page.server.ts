import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ApiInterface } from '@microsoft/api-extractor-model';
import { parser } from '$lib/server/model';
import { serializeItem, type SerializedApiInterface } from '@greendoc/parse';

export const load: PageServerLoad<{ interface: SerializedApiInterface }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { interface: serializeItem(parser, item as ApiInterface) };
	throw error(404, 'Not found');
};
