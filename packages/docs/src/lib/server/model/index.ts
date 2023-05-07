import { Encoder, Parser } from '@greendoc/parse';
import { TSDocConfiguration, TSDocTagDefinition, TSDocTagSyntaxKind } from '@microsoft/tsdoc';
import core from './core.api.json';
import extensions from './extensions.api.json';
import functions from './functions.api.json';

const tsdocConfiguration = new TSDocConfiguration();

const categoryTag = new TSDocTagDefinition({
	tagName: '@category',
	syntaxKind: TSDocTagSyntaxKind.InlineTag
});
tsdocConfiguration.addTagDefinition(categoryTag);
tsdocConfiguration.setSupportForTag(categoryTag, true);

export const parser = new Parser()
	.addPackage('core.api.json', core, tsdocConfiguration)
	.addPackage('extensions.api.json', extensions, tsdocConfiguration)
	.addPackage('functions.api.json', functions, tsdocConfiguration)
	.init();

export const encoder = new Encoder();
