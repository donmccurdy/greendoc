import { Encoder, Parser } from '@greendoc/parse';

const BASE = '/Users/donmccurdy/Documents/Projects/glTF-Transform';

export const parser = new Parser()
	.addPackage('@gltf-transform/core', `${BASE}/packages/core/src/core.ts`)
	.addPackage('@gltf-transform/extensions', `${BASE}/packages/extensions/src/extensions.ts`)
	.addPackage('@gltf-transform/functions', `${BASE}/packages/functions/src/index.ts`)
	.init();

export const encoder = new Encoder();
