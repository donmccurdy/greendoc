import type { LayoutServerLoad } from './$types';
import { packages } from '$lib/server/api/';
import { ApiItemKind, type ApiEntryPoint, type ApiPackage } from '@microsoft/api-extractor-model';

const core = packages.find((pkg) => pkg.displayName === '@gltf-transform/core') as ApiPackage;
const coreEntry = core.members[0] as ApiEntryPoint;

export const load: LayoutServerLoad = () => {
	return {
		navigation: {
			sections: [
				{
					title: 'Introduction',
					items: [
						{ text: 'Home ', href: '/' },
						{ text: 'Concepts ', href: '/concepts.html' },
						{ text: 'Extensions ', href: '/extensions.html' },
						{ text: 'Functions ', href: '/functions.html' },
						{ text: 'CLI ', href: '/cli.html' },
						{ text: 'Contributing ', href: '/contributing.html' },
						{ text: 'Credits ', href: '/credits.html' },
						{
							text: 'GitHub',
							external: true,
							href: 'https://github.com/donmccurdy/glTF-Transform'
						},
						{
							text: 'NPM',
							external: true,
							href: 'https://www.npmjs.com/search?q=%40gltf-transform'
						},
						{
							text: 'Discussions',
							external: true,
							href: 'https://github.com/donmccurdy/glTF-Transform/discussions'
						},
						{
							text: 'Changelog',
							external: true,
							href: 'https://github.com/donmccurdy/glTF-Transform/blob/main/CHANGELOG.md'
						}
					]
				},
				{
					title: 'Documents',
					items: coreEntry.members
						.filter((member) => member.kind === ApiItemKind.Class)
						.map((member) => ({
							text: member.displayName,
							href: `/classes/core.${member.displayName.toLowerCase()}.html`
						}))
				},
				{
					title: 'I/O',
					items: []
				},
				{
					title: 'Properties',
					items: []
				}
			]
		}
	};
};
