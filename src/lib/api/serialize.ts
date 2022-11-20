import {
	ApiClass,
	ApiEnum,
	ApiEnumMember,
	ApiInterface,
	ApiItemKind,
	ApiMethod,
	ApiProperty,
	ApiTypeAlias,
	Excerpt,
	ExcerptTokenKind,
	type ApiItem
} from '@microsoft/api-extractor-model';
import type { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import { getItemByCanonicalReference, getPath } from '../server/models';
import { renderDocNodes, renderMarkdown } from './format';
import type { DocComment } from '@microsoft/tsdoc';
import type {
	SerializedApiEnum,
	SerializedApiInterface,
	SerializedApiMethod,
	SerializedApiProperty,
	SerializedApiClass,
	SerializedApiEnumMember,
	SerializedApiTypeAlias,
	SerializedApiItem,
	SerializedExerpt,
	SerializedToken,
	SerializedReference
} from './types';

export function serializeItem(item: ApiEnum): SerializedApiEnum;
export function serializeItem(item: ApiInterface): SerializedApiInterface;
export function serializeItem(item: ApiMethod): SerializedApiMethod;
export function serializeItem(item: ApiProperty): SerializedApiProperty;
export function serializeItem(item: ApiClass): SerializedApiClass;
export function serializeItem(item: ApiEnum): SerializedApiEnum;
export function serializeItem(item: ApiEnumMember): SerializedApiEnumMember;
export function serializeItem(item: ApiTypeAlias): SerializedApiTypeAlias;
export function serializeItem(item: ApiItem): SerializedApiItem {
	const json: SerializedApiItem = {
		kind: item.kind,
		name: item.displayName
	};

	if (item instanceof ApiClass) {
		console.log(item.sourceLocation.fileUrl);
		return {
			...json,
			path: getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: serializeComment(item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			extendsType: item.extendsType ? serializeExcerpt(item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => serializeItem(member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => serializeItem(member as ApiMethod))
		} as SerializedApiClass;
	} else if (item instanceof ApiInterface) {
		return {
			...json,
			path: getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: serializeComment(item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			// extendsType: item.extendsTypes ? serializeExcerpt(item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => serializeItem(member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => serializeItem(member as ApiMethod))
		} as SerializedApiInterface;
	} else if (item instanceof ApiMethod) {
		return {
			...json,
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: serializeExcerpt(item.excerpt),
			comment: serializeComment(item.tsdocComment)
		} as SerializedApiMethod;
	} else if (item instanceof ApiProperty) {
		return {
			...json,
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: serializeExcerpt(item.excerpt),
			comment: serializeComment(item.tsdocComment)
		} as SerializedApiProperty;
	} else if (item instanceof ApiEnum) {
		return {
			...json,
			comment: serializeComment(item.tsdocComment),
			members: item.members.map((item) => serializeItem(item))
		} as SerializedApiEnum;
	} else if (item instanceof ApiEnumMember) {
		item.sourceLocation;
		return {
			...json,
			comment: serializeComment(item.tsdocComment),
			excerpt: serializeExcerpt(item.excerpt)
		} as SerializedApiEnumMember;
	} else if (item instanceof ApiTypeAlias) {
		return {
			...json
		} as SerializedApiTypeAlias;
	}
	console.log(item);
	throw new Error(`Unsupported serialization type, "${item.kind}"`);
}

export function serializeExcerpt(excerpt: Excerpt): SerializedExerpt {
	const tokens = [] as SerializedToken[];
	for (const token of excerpt.tokens) {
		if (token.kind === ExcerptTokenKind.Content) {
			tokens.push(token.text);
		} else if (token.kind === ExcerptTokenKind.Reference) {
			tokens.push(serializeReference(token.canonicalReference!) || token.text);
		}
	}
	return { tokens };
}

export function serializeReference(ref: DeclarationReference): SerializedReference | null {
	const item = getItemByCanonicalReference(ref)!;
	if (!item) return null;
	return {
		path: getPath(item),
		name: item.displayName,
		kind: item.kind
	};
}

export function serializeComment(comment?: DocComment): string {
	if (!comment) return '';
	const md = renderDocNodes(comment.getChildNodes());
	return renderMarkdown(md);
}
