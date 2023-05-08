import { Encoder, Parser } from '@greendoc/parse';
import { Project } from 'ts-morph';

const BASE = '/Users/donmccurdy/Documents/Projects/glTF-Transform';

const project = new Project({
	compilerOptions: {
		paths: {
			'@gltf-transform/core': [`${BASE}/packages/core/src/core.ts`],
			'@gltf-transform/extensions': [`${BASE}/packages/extensions/src/extensions.ts`],
			'@gltf-transform/functions': [`${BASE}/packages/functions/src/index.ts`]
		}
	}
});

export const parser = new Parser(project)
	.addPackageFromPath('@gltf-transform/core', `${BASE}/packages/core/src/core.ts`)
	.addPackageFromPath('@gltf-transform/extensions', `${BASE}/packages/extensions/src/extensions.ts`)
	.addPackageFromPath('@gltf-transform/functions', `${BASE}/packages/functions/src/index.ts`)
	.init();

export const encoder = new Encoder();
