import type { ApiItemKind } from '@microsoft/api-extractor-model';

// TODO(design): Clean up API from an end-user perspective.
export namespace GD {
	export interface ApiItem {
		name: string;
		kind: ApiItemKind;
	}

	export interface ApiClass extends ApiItem {
		// TODO: static?
		// TODO: resolved & unresolved generics?
		kind: ApiItemKind.Class;
		path: string | null; // urlPath
		packageName: string; // → package
		comment: string; // → IntlText
		sourceUrl: string; // remove
		sourceUrlPath: string; // → sourcePath
		extendsType: Excerpt | null; // → extends
		// TODO: implements?
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

	export type ApiMember = ApiMethod | ApiProperty;

	export interface ApiMethod extends ApiItem {
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

	export interface ApiProperty extends ApiItem {
		kind: ApiItemKind.Property;
		isStatic: boolean;
		isProtected: Boolean;
		isOptional: boolean;
		overwrite?: Reference;
		excerpt: Excerpt;
		comment: string;
		sourceUrl: string;
		sourceUrlPath: string;
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
