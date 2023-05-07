import type { ApiItemKind } from '@microsoft/api-extractor-model';

// TODO(design): Clean up API from an end-user perspective.
export namespace GD {
	export interface ApiItem {
		name: string;
		kind: ApiItemKind;
	}

	export interface ApiClass extends ApiItem {
		// TODO: resolved & unresolved generics?
		// TODO: interfaces implemented?
		kind: ApiItemKind.Class;
		path: string | null;
		packageName: string; // → package
		comment: string; // → IntlText
		sourceUrl: string; // remove
		sourceUrlPath: string; // → sourcePath
		extendsType: Excerpt | null; // → extends;
		// TODO: hierarchy (up/down)
		properties: ApiProperty[];
		methods: ApiMethod[];
		// TODO: overloads?
		staticProperties: ApiProperty[];
		staticMethods: ApiMethod[];
	}

	export interface ApiInterface extends ApiItem {
		kind: ApiItemKind.Interface;
		path: string | null;
		packageName: string;
		comment: string;
		sourceUrl: string;
		sourceUrlPath: string;
		extendsTypes: Excerpt[];
		properties: ApiProperty[];
		methods: ApiMethod[];
		staticProperties: ApiProperty[];
		staticMethods: ApiMethod[];
	}

	export interface ApiMember extends ApiItem {
		kind: ApiItemKind.Method;
		isStatic: boolean;
		isProtected: boolean;
		isOptional: boolean;
		overwrite?: Reference;
		excerpt: Excerpt;
		comment: string;
		sourceUrl: string;
		sourceUrlPath: string;
	}

	export interface ApiMethod extends ApiMember {}

	export interface ApiProperty extends ApiMember {
		isReadonly: boolean;
	}

	export interface ApiEnum extends ApiItem {
		kind: ApiItemKind.Enum;
		comment: string;
		sourceUrl: string;
		sourceUrlPath: string;
	}

	export interface ApiEnumMember extends ApiItem {
		kind: ApiItemKind.EnumMember;
		comment: string;
		excerpt: Excerpt;
	}

	export interface Excerpt {
		tokens: Token[];
	}

	export type Token = string | Reference;

	export interface Reference {
		path: string | null;
		name: string;
		kind: ApiItemKind;
	}

	export interface ApiTypeAlias extends ApiItem {}
}
