import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		title: 'glTF Transform',
		content: 'Lorem ipsum dolor sit amet...'
	};
};
