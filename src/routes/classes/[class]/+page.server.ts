import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { packages } from '$lib/server/api';
import type { ApiClass, ApiEntryPoint, ApiPackage } from '@microsoft/api-extractor-model';
import { serializeItem, type SerializedApiClass } from '$lib/server/serialize';

const corePackage = packages.find(
	(pkg) => pkg.displayName === '@gltf-transform/core'
) as ApiPackage;
const coreEntry = corePackage.members[0] as ApiEntryPoint;

interface ClassOutputData {
	class: SerializedApiClass;
}

export const load: PageServerLoad<ClassOutputData> = async ({ params }) => {
	const item = coreEntry.members.find((member) => {
		return `core.${member.displayName.toLowerCase()}.html` === params.class;
	});

	if (item) {
		return { class: serializeItem(item as ApiClass) };
	}

	throw error(404, 'Not found');
};
