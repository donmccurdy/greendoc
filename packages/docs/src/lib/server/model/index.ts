import { Encoder, Parser } from '@greendoc/parse';

const BASE = '/Users/donmccurdy/Documents/Projects/glTF-Transform';

export const parser = new Parser()
	.addPackageFromPath('@gltf-transform/core', `${BASE}/packages/core/src/core.ts`)
	.addPackageFromPath('@gltf-transform/extensions', `${BASE}/packages/extensions/src/extensions.ts`)
	.addPackageFromPath('@gltf-transform/functions', `${BASE}/packages/functions/src/index.ts`)
	.init();

export const encoder = new Encoder();
