import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getItemBySlug } from '$lib/server/models';
import type { ApiInterface } from '@microsoft/api-extractor-model';
import { serializeItem, type SerializedApiInterface } from '$lib/api';

export const load: PageServerLoad<{ interface: SerializedApiInterface }> = async ({ params }) => {
	const item = getItemBySlug(params.slug);
	if (item) return { interface: serializeItem(item as ApiInterface) };
	throw error(404, 'Not found');
};
