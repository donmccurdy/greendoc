import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import core from '$lib/server/api/core.api.json';

export const load: PageServerLoad = async ({ params }) => {
	console.log({ params });

	const post = {
		title: 'glTF Transform',
		content: 'Lorem ipsum dolor sit amet...',
		packages: [core]
	};

	if (post) {
		return post;
	}

	throw error(404, 'Not found');
};
