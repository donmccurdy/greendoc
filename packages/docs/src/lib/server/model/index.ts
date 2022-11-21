import { Encoder, Parser } from '@greendoc/parse';
import core from './core.api.json';
import extensions from './extensions.api.json';
import functions from './functions.api.json';

export const parser = new Parser()
	.addPackage(core, 'core.api.json')
	.addPackage(extensions, 'extensions.api.json')
	.addPackage(functions, 'functions.api.json')
	.init();

export const encoder = new Encoder();
