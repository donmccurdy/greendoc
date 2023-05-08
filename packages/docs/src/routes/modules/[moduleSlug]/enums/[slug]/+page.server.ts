import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parser, encoder } from '$lib/server/model';
import type { GD } from '@greendoc/parse';
import type { EnumDeclaration } from 'ts-morph';

export const load: PageServerLoad<{ enum: GD.ApiEnum }> = async ({ params }) => {
	const item = parser.getItemBySlug(params.slug);
	if (item) return { enum: encoder.encodeItem(parser, item as EnumDeclaration) };
	throw error(404, 'Not found');
};