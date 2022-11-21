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

export class Encoder {
	encodeItem(parser: Parser, item: ApiEnum): GD.ApiEnum;
	encodeItem(parser: Parser, item: ApiInterface): GD.ApiInterface;
	encodeItem(parser: Parser, item: ApiMethod): GD.ApiMethod;
	encodeItem(parser: Parser, item: ApiProperty): GD.ApiProperty;
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
			case ApiItemKind.Method:
				return this._encodeMethod(parser, item as ApiMethod);
			case ApiItemKind.Property:
				return this._encodeProperty(parser, item as ApiProperty);
			case ApiItemKind.Enum:
				return this._encodeEnum(parser, item as ApiEnum);
			case ApiItemKind.EnumMember:
				return this._encodeEnumMember(parser, item as ApiEnumMember);
			case ApiItemKind.TypeAlias:
				return this._encodeTypeAlias(parser, item as ApiTypeAlias);
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
			properties: properties.filter(({ isStatic }) => !isStatic),
			methods: methods.filter(({ isStatic }) => !isStatic),
			staticProperties: properties.filter(({ isStatic }) => isStatic),
			staticMethods: methods.filter(({ isStatic }) => isStatic)
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
			properties: properties.filter(({ isStatic }) => !isStatic),
			methods: methods.filter(({ isStatic }) => !isStatic),
			staticProperties: properties.filter(({ isStatic }) => isStatic),
			staticMethods: methods.filter(({ isStatic }) => isStatic)
		} as GD.ApiInterface;
	}

	protected _encodeMethod(parser: Parser, item: ApiMethod): GD.ApiMethod {
		return {
			...this._encodeItem(parser, item),
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: this._encodeExcerpt(parser, item.excerpt),
			comment: this._encodeComment(parser, item.tsdocComment),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath
		} as GD.ApiMethod;
	}
	protected _encodeProperty(parser: Parser, item: ApiProperty): GD.ApiProperty {
		return {
			...this._encodeItem(parser, item),
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: this._encodeExcerpt(parser, item.excerpt),
			comment: this._encodeComment(parser, item.tsdocComment),
			sourceUrl: item.sourceLocation.fileUrl,
			sourceUrlPath: item.fileUrlPath
		} as GD.ApiProperty;
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
		item: ApiClass | ApiInterface,
		kind: ApiItemKind.Method
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiProperty>(
		parser: Parser,
		item: ApiClass | ApiInterface,
		kind: ApiItemKind.Property
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiMethod | GD.ApiProperty>(
		parser: Parser,
		childItem: ApiClass | ApiInterface,
		kind: ApiItemKind.Method | ApiItemKind.Property
	): T[] {
		const inheritedMembers = {} as Record<string, T>;
		const parentItems = [childItem, ...getExtendsTypes(parser, childItem)];
		for (const parentItem of parentItems) {
			const parentMembers = parentItem.members.filter((m) => m.kind === kind) as unknown as T[];
			for (const member of parentMembers) {
				const inheritedMember = inheritedMembers[member.name];
				if (parentItem === childItem || !inheritedMember) {
					if (kind === ApiItemKind.Method) {
						// Store base method.
						inheritedMembers[member.name] = this._encodeMethod(
							parser,
							member as unknown as ApiMethod
						) as T;
					} else if (kind === ApiItemKind.Property) {
						// Store base property.
						inheritedMembers[member.name] = this._encodeProperty(
							parser,
							member as unknown as ApiProperty
						) as T;
					}
				} else if (inheritedMember.overwrite) {
					// If first overwrite is already found, continue;
					// TODO: Add TSDoc if missing.
					continue;
				} else {
					// If this is the first overwrite, annotate it.
					// TODO: Add TSDoc if missing.
					const overwrite = this._encodeReference(parser, parentItem.canonicalReference);
					if (overwrite) inheritedMember.overwrite = overwrite;
				}
			}
		}
		return Object.values(inheritedMembers);
	}
}

function getExtendsTypes<T extends ApiClass | ApiInterface>(parser: Parser, base: T): T[] {
	const extendsTypes = [] as HeritageType[];
	function pushExtendsTypes(item: ApiClass | ApiInterface): void {
		if (item.kind === ApiItemKind.Class && (item as ApiClass).extendsType) {
			extendsTypes.push((item as ApiClass).extendsType!);
		} else if (item.kind === ApiItemKind.Interface) {
			extendsTypes.push(...(item as ApiInterface).extendsTypes);
		}
	}

	pushExtendsTypes(base);

	const results = [] as T[];
	for (const extendsType of extendsTypes) {
		for (const token of extendsType.excerpt.spannedTokens) {
			if (token.kind === ExcerptTokenKind.Reference && token.canonicalReference) {
				const result = parser.getItemByCanonicalReference(token.canonicalReference);
				if (result) {
					results.push(result as T);
					pushExtendsTypes(result as T);
				} else {
					console.warn(`Missing reference for base class, ${token.canonicalReference.toString()}`);
				}
				// Not all tokens in the list are classes/interfaces. For lack of a better
				// criteria, bail out after the first reference.
				continue;
			}
		}
	}
	return results;
}
