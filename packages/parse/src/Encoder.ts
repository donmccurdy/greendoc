import {
	ApiClass,
	ApiEnum,
	ApiEnumMember,
	ApiInterface,
	ApiItem,
	ApiItemKind,
	ApiMethod,
	ApiProperty,
	ApiTypeAlias,
	Excerpt,
	ExcerptTokenKind,
	HeritageType
} from '@microsoft/api-extractor-model';
import type { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import { renderDocNodes, renderMarkdown } from './format';
import { DocComment } from '@microsoft/tsdoc';
import type { GD } from './types';
import { Parser } from './Parser';

// TODO(feat): Sort results.
export class Encoder {
	encodeItem(parser: Parser, item: ApiEnum): GD.ApiEnum;
	encodeItem(parser: Parser, item: ApiInterface): GD.ApiInterface;
	encodeItem(parser: Parser, item: ApiClass): GD.ApiClass;
	encodeItem(parser: Parser, item: ApiEnum): GD.ApiEnum;
	encodeItem(parser: Parser, item: ApiEnumMember): GD.ApiEnumMember;
	encodeItem(parser: Parser, item: ApiTypeAlias): GD.ApiTypeAlias;
	encodeItem(parser: Parser, item: ApiItem): GD.ApiItem {
		switch (item.kind) {
			case ApiItemKind.Class:
				return this._encodeClass(parser, item as ApiClass);
			case ApiItemKind.Interface:
				return this._encodeInterface(parser, item as ApiInterface);
			case ApiItemKind.Enum:
				return this._encodeEnum(parser, item as ApiEnum);
			case ApiItemKind.EnumMember:
				return this._encodeEnumMember(parser, item as ApiEnumMember);
			case ApiItemKind.TypeAlias:
				return this._encodeTypeAlias(parser, item as ApiTypeAlias);
			case ApiItemKind.Property:
			case ApiItemKind.Method:
				throw new Error(`Unexpected detached type, "${item.kind}"`);
			default:
				console.log(item);
				throw new Error(`Unsupported encoded type, "${item.kind}"`);
		}
	}

	protected _encodeItem(parser: Parser, item: ApiItem): GD.ApiItem {
		return {
			kind: item.kind,
			name: item.displayName
		};
	}

	protected _encodeClass(parser: Parser, item: ApiClass): GD.ApiClass {
		const properties = this._encodeInheritedMembers(parser, item, ApiItemKind.Property);
		const methods = this._encodeInheritedMembers(parser, item, ApiItemKind.Method);
		return {
			...this._encodeItem(parser, item),
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: this._encodeComment(parser, item.tsdocComment),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath,
			extendsType: item.extendsType ? this._encodeExcerpt(parser, item.extendsType.excerpt) : null,
			staticProperties: properties.filter(({ isStatic }) => isStatic),
			properties: properties.filter(({ isStatic }) => !isStatic),
			staticMethods: methods.filter(({ isStatic }) => isStatic),
			methods: methods.filter(({ isStatic }) => !isStatic)
		} as GD.ApiClass;
	}

	protected _encodeInterface(parser: Parser, item: ApiInterface): GD.ApiInterface {
		const properties = this._encodeInheritedMembers(parser, item, ApiItemKind.Property);
		const methods = this._encodeInheritedMembers(parser, item, ApiItemKind.Method);
		return {
			...this._encodeItem(parser, item),
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: this._encodeComment(parser, item.tsdocComment),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath,
			extendsTypes: item.extendsTypes.map(({ excerpt }) => this._encodeExcerpt(parser, excerpt)),
			staticProperties: properties.filter(({ isStatic }) => isStatic),
			properties: properties.filter(({ isStatic }) => !isStatic),
			staticMethods: methods.filter(({ isStatic }) => isStatic),
			methods: methods.filter(({ isStatic }) => !isStatic)
		} as GD.ApiInterface;
	}

	protected _encodeEnum(parser: Parser, item: ApiEnum): GD.ApiEnum {
		return {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.tsdocComment),
			members: item.members.map((item) => this.encodeItem(parser, item)),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath
		} as GD.ApiEnum;
	}
	protected _encodeEnumMember(parser: Parser, item: ApiEnumMember): GD.ApiEnumMember {
		return {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.tsdocComment),
			excerpt: this._encodeExcerpt(parser, item.excerpt),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath
		} as GD.ApiEnumMember;
	}
	protected _encodeTypeAlias(parser: Parser, item: ApiTypeAlias): GD.ApiTypeAlias {
		return this._encodeItem(parser, item) as GD.ApiTypeAlias;
	}

	protected _encodeExcerpt(parser: Parser, excerpt: Excerpt): GD.Excerpt {
		const tokens = [] as GD.Token[];
		for (const token of excerpt.tokens) {
			if (token.kind === ExcerptTokenKind.Content) {
				tokens.push(token.text);
			} else if (token.kind === ExcerptTokenKind.Reference) {
				tokens.push(this._encodeReference(parser, token.canonicalReference!) || token.text);
			}
		}
		return { tokens };
	}

	protected _encodeReference(parser: Parser, ref: DeclarationReference): GD.Reference | null {
		const item = parser.getItemByCanonicalReference(ref)!;
		if (!item) return null;
		return {
			path: parser.getPath(item),
			name: item.displayName,
			kind: item.kind
		};
	}

	protected _encodeComment(parser: Parser, comment?: DocComment): string {
		if (!comment) return '';
		const md = renderDocNodes(comment.getChildNodes());
		return renderMarkdown(md);
	}

	protected _encodeInheritedMembers<T extends GD.ApiMethod>(
		parser: Parser,
		childItem: ApiClass | ApiInterface,
		kind: ApiItemKind.Method
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiProperty>(
		parser: Parser,
		childItem: ApiClass | ApiInterface,
		kind: ApiItemKind.Property
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiMethod | GD.ApiProperty>(
		parser: Parser,
		childItem: ApiClass | ApiInterface,
		kind: ApiItemKind.Method | ApiItemKind.Property
	): T[] {
		// (1) Obtain leaf member.
		// (2) Walk up tree until missing info resolved and a direct override found, if exists.
		// (3) Return resolved member.
		const result = childItem.findMembersWithInheritance();

		if (result.maybeIncompleteResult) {
			console.warn(`findMembersWithInheritance: ${JSON.stringify(result.messages)}`);
		}

		const encodedMembers = [] as T[];
		for (const member of result.items as (ApiMethod | ApiProperty)[]) {
			if (member.kind === kind) {
				encodedMembers.push(this._resolveInheritedMember(parser, member, null));
			}
		}

		return encodedMembers;

		// const inheritedMembers = {} as Record<string, T>;
		// const parentItems = [childItem, ...getExtendsTypes(parser, childItem)];
		// for (const parentItem of parentItems) {
		// 	const parentMembers = parentItem.members.filter((m) => m.kind === kind) as unknown as T[];
		// 	for (const member of parentMembers) {
		// 		const inheritedMember = inheritedMembers[member.name];
		// 		if (parentItem === childItem || !inheritedMember) {
		// 			if (kind === ApiItemKind.Method) {
		// 				// Store base method.
		// 				inheritedMembers[member.name] = this._encodeMethod(
		// 					parser,
		// 					member as unknown as ApiMethod
		// 				) as T;
		// 			} else if (kind === ApiItemKind.Property) {
		// 				// Store base property.
		// 				inheritedMembers[member.name] = this._encodeProperty(
		// 					parser,
		// 					member as unknown as ApiProperty
		// 				) as T;
		// 			}
		// 		} else if (inheritedMember.overwrite) {
		// 			// If first overwrite is already found, continue;
		// 			// TODO: Add TSDoc if missing.
		// 			continue;
		// 		} else {
		// 			// If this is the first overwrite, annotate it.
		// 			// TODO: Add TSDoc if missing.
		// 			const overwrite = this._encodeReference(parser, parentItem.canonicalReference);
		// 			if (overwrite) inheritedMember.overwrite = overwrite;
		// 		}
		// 	}
		// }
		// return Object.values(inheritedMembers);
	}

	protected _resolveInheritedMember<T extends GD.ApiMethod | GD.ApiProperty>(
		parser: Parser,
		member: ApiMethod | ApiProperty,
		target: Partial<T> | null
	): T {
		const parent = member.parent as ApiClass | ApiInterface | undefined;
		if (!parent) {
			throw new Error(`Unexpected detached member of type "${member.kind}"`);
		}

		if (!target) {
			target = this._encodeItem(parser, member) as Partial<T>;
		} else if (target.overwrite === undefined) {
			const overwrite = this._encodeReference(parser, parent.canonicalReference);
			if (overwrite) target.overwrite = overwrite;
		}

		if (target.isStatic === undefined) {
			target.isStatic = member.isStatic;
		}
		if (target.isProtected === undefined) {
			target.isProtected = member.isProtected;
		}
		if (target.isOptional === undefined) {
			target.isOptional = member.isOptional;
		}
		if (target.excerpt === undefined) {
			target.excerpt = this._encodeExcerpt(parser, member.excerpt);
		}
		if (target.comment === undefined || target.comment === '') {
			target.comment = this._encodeComment(parser, member.tsdocComment);
		}
		if (target.sourceUrl === undefined) {
			target.sourceUrl = member.sourceLocation.fileUrl;
		}
		if (target.sourceUrlPath === undefined) {
			target.sourceUrlPath = member.fileUrlPath;
		}

		// TODO(feat): Consider how to include merged siblings, multiple overrides. If that's
		// what we're returned by findMembersByName?
		// See: member.getMergedSiblings();
		const nextParent = getExtends(parser, parent);
		const nextMember = nextParent?.findMembersByName(member.name)[0];
		return nextMember
			? this._resolveInheritedMember(parser, nextMember as ApiMethod | ApiProperty, target)
			: (target as T);
	}
}

// TODO(feat): Would really like to be able to display a full inheritance tree, this includes
// resolving generics etc. Consider how to refactor this and getExtendsTypes below.
function getExtends<T extends ApiClass | ApiInterface>(parser: Parser, base: T): T | null {
	const extendsTypes = [] as HeritageType[];
	function pushExtendsTypes(item: ApiClass | ApiInterface): void {
		if (item.kind === ApiItemKind.Class && (item as ApiClass).extendsType) {
			extendsTypes.push((item as ApiClass).extendsType!);
		} else if (item.kind === ApiItemKind.Interface) {
			extendsTypes.push(...(item as ApiInterface).extendsTypes);
		}
	}
	pushExtendsTypes(base);

	for (const extendsType of extendsTypes) {
		for (const token of extendsType.excerpt.spannedTokens) {
			if (token.kind === ExcerptTokenKind.Reference && token.canonicalReference) {
				const result = parser.getItemByCanonicalReference(token.canonicalReference);
				if (result) {
					return result as T;
				} else {
					console.warn(`Missing reference for base class, ${token.canonicalReference.toString()}`);
				}
				// Not all tokens in the list are classes/interfaces. For lack of a better
				// criteria, bail out after the first reference.
				continue;
			}
		}
	}
	return null;
}

// function getExtendsTypes<T extends ApiClass | ApiInterface>(parser: Parser, base: T): T[] {
// 	const extendsTypes = [] as HeritageType[];
// 	function pushExtendsTypes(item: ApiClass | ApiInterface): void {
// 		if (item.kind === ApiItemKind.Class && (item as ApiClass).extendsType) {
// 			extendsTypes.push((item as ApiClass).extendsType!);
// 		} else if (item.kind === ApiItemKind.Interface) {
// 			extendsTypes.push(...(item as ApiInterface).extendsTypes);
// 		}
// 	}

// 	pushExtendsTypes(base);

// 	const results = [] as T[];
// 	for (const extendsType of extendsTypes) {
// 		for (const token of extendsType.excerpt.spannedTokens) {
// 			if (token.kind === ExcerptTokenKind.Reference && token.canonicalReference) {
// 				const result = parser.getItemByCanonicalReference(token.canonicalReference);
// 				if (result) {
// 					results.push(result as T);
// 					pushExtendsTypes(result as T);
// 				} else {
// 					console.warn(`Missing reference for base class, ${token.canonicalReference.toString()}`);
// 				}
// 				// Not all tokens in the list are classes/interfaces. For lack of a better
// 				// criteria, bail out after the first reference.
// 				continue;
// 			}
// 		}
// 	}
// 	return results;
// }
