import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	console.log({ params });

	const post = {
		title: params.interface,
		content: 'Lorem ipsum dolor sit amet...'
	};

	if (post) {
		return post;
	}

	throw error(404, 'Not found');
};
