import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { ApiClass } from '@microsoft/api-extractor-model';
import { parser } from '$lib/server/model';
import { serializeItem, type SerializedApiClass } from '@greendoc/parse';

export const load: PageServerLoad<{ class: SerializedApiClass }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { class: serializeItem(parser, item as ApiClass) };
	throw error(404, 'Not found');
};
