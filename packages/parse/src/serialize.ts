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
import type { Parser } from './Parser';

export function serializeItem(parser: Parser, item: ApiEnum): SerializedApiEnum;
export function serializeItem(parser: Parser, item: ApiInterface): SerializedApiInterface;
export function serializeItem(parser: Parser, item: ApiMethod): SerializedApiMethod;
export function serializeItem(parser: Parser, item: ApiProperty): SerializedApiProperty;
export function serializeItem(parser: Parser, item: ApiClass): SerializedApiClass;
export function serializeItem(parser: Parser, item: ApiEnum): SerializedApiEnum;
export function serializeItem(parser: Parser, item: ApiEnumMember): SerializedApiEnumMember;
export function serializeItem(parser: Parser, item: ApiTypeAlias): SerializedApiTypeAlias;
export function serializeItem(parser: Parser, item: ApiItem): SerializedApiItem {
	const json: SerializedApiItem = {
		kind: item.kind,
		name: item.displayName
	};

	if (item instanceof ApiClass) {
		console.log(item.sourceLocation.fileUrl);
		return {
			...json,
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: serializeComment(parser, item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			extendsType: item.extendsType ? serializeExcerpt(parser, item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => serializeItem(parser, member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => serializeItem(parser, member as ApiMethod))
		} as SerializedApiClass;
	} else if (item instanceof ApiInterface) {
		return {
			...json,
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: serializeComment(parser, item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			// extendsType: item.extendsTypes ? serializeExcerpt(item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => serializeItem(parser, member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => serializeItem(parser, member as ApiMethod))
		} as SerializedApiInterface;
	} else if (item instanceof ApiMethod) {
		return {
			...json,
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: serializeExcerpt(parser, item.excerpt),
			comment: serializeComment(parser, item.tsdocComment)
		} as SerializedApiMethod;
	} else if (item instanceof ApiProperty) {
		return {
			...json,
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: serializeExcerpt(parser, item.excerpt),
			comment: serializeComment(parser, item.tsdocComment)
		} as SerializedApiProperty;
	} else if (item instanceof ApiEnum) {
		return {
			...json,
			comment: serializeComment(parser, item.tsdocComment),
			members: item.members.map((item) => serializeItem(parser, item))
		} as SerializedApiEnum;
	} else if (item instanceof ApiEnumMember) {
		item.sourceLocation;
		return {
			...json,
			comment: serializeComment(parser, item.tsdocComment),
			excerpt: serializeExcerpt(parser, item.excerpt)
		} as SerializedApiEnumMember;
	} else if (item instanceof ApiTypeAlias) {
		return {
			...json
		} as SerializedApiTypeAlias;
	}
	console.log(item);
	throw new Error(`Unsupported serialization type, "${item.kind}"`);
}

export function serializeExcerpt(parser: Parser, excerpt: Excerpt): SerializedExerpt {
	const tokens = [] as SerializedToken[];
	for (const token of excerpt.tokens) {
		if (token.kind === ExcerptTokenKind.Content) {
			tokens.push(token.text);
		} else if (token.kind === ExcerptTokenKind.Reference) {
			tokens.push(serializeReference(parser, token.canonicalReference!) || token.text);
		}
	}
	return { tokens };
}

export function serializeReference(parser: Parser, ref: DeclarationReference): SerializedReference | null {
	const item = parser.getItemByCanonicalReference(ref)!;
	if (!item) return null;
	return {
		path: parser.getPath(item),
		name: item.displayName,
		kind: item.kind
	};
}

export function serializeComment(parser: Parser, comment?: DocComment): string {
	if (!comment) return '';
	const md = renderDocNodes(comment.getChildNodes());
	return renderMarkdown(md);
}
