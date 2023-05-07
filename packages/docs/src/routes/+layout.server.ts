import type { LayoutServerLoad } from './$types';
import { parser } from '$lib/server/model';

// export const prerender = true;

export const load: LayoutServerLoad = () => {
	return {
		navigation: {
			sections: [
				{
					title: 'Introduction',
					items: [
						// { text: 'Home ', href: '/' },
						// { text: 'Concepts ', href: '/concepts.html' },
						{ text: 'Extensions ', href: '/extensions.html' },
						// { text: 'Functions ', href: '/functions.html' },
						// { text: 'CLI ', href: '/cli.html' },
						// { text: 'Contributing ', href: '/contributing.html' },
						// { text: 'Credits ', href: '/credits.html' },
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
				...parser.packages.map((pkg) => ({
					title: pkg.name,
					items: pkg.exports.map((item) => ({
						text: item.name,
						href: item.path
					}))
				}))
			]
		}
	};
};
