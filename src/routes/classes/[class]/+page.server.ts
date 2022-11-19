import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { packages } from '$lib/server/api';
import type { ApiEntryPoint, ApiPackage } from '@microsoft/api-extractor-model';

const corePackage = packages.find(
	(pkg) => pkg.displayName === '@gltf-transform/core'
) as ApiPackage;
const coreEntry = corePackage.members[0] as ApiEntryPoint;

export const load: PageServerLoad = async ({ params }) => {
	console.log('search...', { params });

	const member = coreEntry.members.find((member) => {
		return `core.${member.displayName.toLowerCase()}.html` === params.class;
	});

	if (member) {
		const content = {};
		member.serializeInto(content);
		return {
			title: member.displayName,
			content
		};
	}

	throw error(404, 'Not found');
};
