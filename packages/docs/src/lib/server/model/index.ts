import { Encoder, Parser } from '@greendoc/parse';

const BASE = '/Users/donmccurdy/Documents/Projects/glTF-Transform';

export const parser = new Parser()
	.addPackage('@gltf-transform/core', `${BASE}/packages/core/dist/core.d.ts`)
	.addPackage('@gltf-transform/extensions', `${BASE}/packages/extensions/dist/extensions.d.ts`)
	.addPackage('@gltf-transform/functions', `${BASE}/packages/functions/dist/index.d.ts`)
	.init();

export const encoder = new Encoder();
