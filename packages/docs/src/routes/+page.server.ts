import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		metadata: {
			title: 'greendoc',
			snippet: 'An adaptable system for generating documentation of TypeScript APIs.'
		}
	};
};
