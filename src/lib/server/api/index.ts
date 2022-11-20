import { ApiItem, ApiItemKind, ApiModel, ApiPackage } from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import type { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import core from './core.api.json';
import extensions from './extensions.api.json';
import functions from './functions.api.json';

type $IntentionalAny = any;

function createPackage(json: $IntentionalAny, name: string): ApiPackage {
	return ApiPackage.deserialize(json as $IntentionalAny, {
		apiJsonFilename: name,
		toolPackage: json.metadata.toolPackage,
		toolVersion: json.metadata.toolVersion,
		versionToDeserialize: json.metadata.schemaVersion,
		tsdocConfiguration: new TSDocConfiguration()
	}) as ApiPackage;
}

const corePackage = createPackage(core, 'core.api.json');
const extensionsPackage = createPackage(extensions, 'extensions.api.json');
const functionsPackage = createPackage(functions, 'functions.api.json');

const apiModel: ApiModel = new ApiModel();
apiModel.addMember(corePackage);
apiModel.addMember(extensionsPackage);
apiModel.addMember(functionsPackage);

export const packages = [corePackage, extensionsPackage, functionsPackage];

// store slugs and canonical references for exported members
const itemToSlug = new Map<ApiItem, string>();
const slugToItem = new Map<string, ApiItem>();
const canonicalReferenceToItem = new Map<string, ApiItem>();
for (const pkg of packages) {
	const pkgSlug = pkg.displayName.split('/').pop();
	for (const entry of pkg.members) {
		for (const member of entry.members) {
			const slug = `${pkgSlug}.${member.displayName.toLowerCase()}.html`;
			itemToSlug.set(member, slug);
			slugToItem.set(slug, member);
			canonicalReferenceToItem.set(member.canonicalReference.toString(), member);
		}
	}
}

export function getItemBySlug(slug: string): ApiItem {
	const item = slugToItem.get(slug);
	if (item) return item;
	throw new Error(`Item for "${slug}" not found`);
}

export function getItemByCanonicalReference(
	canonicalReference: DeclarationReference
): ApiItem | null {
	return canonicalReferenceToItem.get(canonicalReference.toString()) || null;
}

export function getSlug(item: ApiItem): string {
	const slug = itemToSlug.get(item);
	if (slug) return slug;
	throw new Error(`Slug for "${item.displayName}" not found`);
}

export function getPath(item: ApiItem): string | null {
	switch (item.kind) {
		case ApiItemKind.Class:
			return `/classes/${getSlug(item)}`;
		case ApiItemKind.Interface:
			return `/interfaces/${getSlug(item)}`;
		// case ApiItemKind.Enum:
		// 	return `/enums/${getSlug(item)}`;
		default:
			return null;
	}
}
