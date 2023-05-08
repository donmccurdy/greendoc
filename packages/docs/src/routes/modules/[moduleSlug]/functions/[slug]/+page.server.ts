import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parser, encoder, getMetadata } from '$lib/server/model';
import type { GD } from '@greendoc/parse';
import type { FunctionDeclaration } from 'ts-morph';

export const load: PageServerLoad<{ export: GD.ApiFunction }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug) as FunctionDeclaration;
	const encodedItem = encoder.encodeItem(parser, item);
	if (item && encodedItem) {
		return {
			metadata: getMetadata(encodedItem),
			export: encodedItem
		};
	}
	throw error(404, 'Not found');
};
