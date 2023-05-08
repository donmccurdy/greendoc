import { Encoder, Parser } from '@greendoc/parse';
import { Project } from 'ts-morph';

const BASE = '/Users/donmccurdy/Documents/Projects/glTF-Transform';

const corePath = `${BASE}/packages/core/src/core.ts`;
const extensionsPath = `${BASE}/packages/extensions/src/extensions.ts`;
const functionsPath = `${BASE}/packages/functions/src/index.ts`;

const project = new Project({
	compilerOptions: {
		paths: {
			'@gltf-transform/core': [corePath],
			'@gltf-transform/extensions': [extensionsPath],
			'@gltf-transform/functions': [functionsPath]
		}
	}
});

export const parser = new Parser(project)
	.addModule({ name: '@gltf-transform/core', slug: 'core', entry: corePath })
	.addModule({ name: '@gltf-transform/extensions', slug: 'extensions', entry: extensionsPath })
	.addModule({ name: '@gltf-transform/functions', slug: 'functions', entry: functionsPath })
	.init();

export const encoder = new Encoder();
