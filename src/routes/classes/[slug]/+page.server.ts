import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getItemBySlug } from '$lib/server/api';
import type { ApiClass } from '@microsoft/api-extractor-model';
import { serializeItem, type SerializedApiClass } from '$lib/server/serialize';

export const load: PageServerLoad<{ class: SerializedApiClass }> = async ({ params }) => {
	const item = getItemBySlug(params.slug);
	if (item) return { class: serializeItem(item as ApiClass) };
	throw error(404, 'Not found');
};
