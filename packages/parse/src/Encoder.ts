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
	ExcerptTokenKind
} from '@microsoft/api-extractor-model';
import type { DeclarationReference } from '@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference';
import { renderDocNodes, renderMarkdown } from './format';
import type { DocComment } from '@microsoft/tsdoc';
import type { GD } from './types';
import type { Parser } from './Parser';

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
		console.log(item.sourceLocation.fileUrl);
		return {
			...this._encodeItem(parser, item),
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: this._encodeComment(parser, item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			extendsType: item.extendsType ? this._encodeExcerpt(parser, item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => this.encodeItem(parser, member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => this.encodeItem(parser, member as ApiMethod))
		} as GD.ApiClass;
	}

	protected _encodeInterface(parser: Parser, item: ApiInterface): GD.ApiInterface {
		return {
			...this._encodeItem(parser, item),
			path: parser.getPath(item),
			packageName: item.getAssociatedPackage()!.name,
			comment: this._encodeComment(parser, item.tsdocComment),
			fileUrlPath: item.fileUrlPath,
			// extendsType: item.extendsTypes ? this.encodeExcerpt(item.extendsType.excerpt) : null,
			properties: item.members
				.filter((member) => member.kind === ApiItemKind.Property)
				.map((member) => this.encodeItem(parser, member as ApiProperty)),
			methods: item.members
				.filter((member) => member.kind === ApiItemKind.Method)
				.map((member) => this.encodeItem(parser, member as ApiMethod))
		} as GD.ApiInterface;
	}

	protected _encodeMethod(parser: Parser, item: ApiMethod): GD.ApiMethod {
		return {
			...this._encodeItem(parser, item),
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: this._encodeExcerpt(parser, item.excerpt),
			comment: this._encodeComment(parser, item.tsdocComment)
		} as GD.ApiMethod;
	}
	protected _encodeProperty(parser: Parser, item: ApiProperty): GD.ApiProperty {
		return {
			...this._encodeItem(parser, item),
			isStatic: item.isStatic,
			isProtected: item.isProtected,
			isOptional: item.isOptional,
			excerpt: this._encodeExcerpt(parser, item.excerpt),
			comment: this._encodeComment(parser, item.tsdocComment)
		} as GD.ApiProperty;
	}
	protected _encodeEnum(parser: Parser, item: ApiEnum): GD.ApiEnum {
		return {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.tsdocComment),
			members: item.members.map((item) => this.encodeItem(parser, item))
		} as GD.ApiEnum;
	}
	protected _encodeEnumMember(parser: Parser, item: ApiEnumMember): GD.ApiEnumMember {
		return {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.tsdocComment),
			excerpt: this._encodeExcerpt(parser, item.excerpt)
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
}
