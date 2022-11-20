import type { ApiItemKind } from '@microsoft/api-extractor-model';

export interface SerializedApiItem {
	name: string;
	kind: string;
}

export interface SerializedApiClass extends SerializedApiItem {
	kind: ApiItemKind.Class;
	path: string | null;
	packageName: string;
	comment: string;
	fileUrlPath: string;
	extendsType: SerializedExerpt | null;
	properties: SerializedApiProperty[];
	methods: SerializedApiMethod[];
}

export interface SerializedApiInterface extends SerializedApiItem {
	kind: ApiItemKind.Interface;
	path: string | null;
	packageName: string;
	comment: string;
	fileUrlPath: string;
	// extendsType: SerializedExerpt | null;
	properties: SerializedApiProperty[];
	methods: SerializedApiMethod[];
}

export type SerializedApiMember = SerializedApiMethod | SerializedApiProperty;

export interface SerializedApiMethod extends SerializedApiItem {
	kind: ApiItemKind.Method;
	isStatic: boolean;
	isProtected: boolean;
	isOptional: boolean;
	excerpt: SerializedExerpt;
	comment: string;
}

export interface SerializedApiProperty extends SerializedApiItem {
	kind: ApiItemKind.Property;
	isStatic: boolean;
	isProtected: Boolean;
	isOptional: boolean;
	excerpt: SerializedExerpt;
	comment: string;
}

export interface SerializedApiEnum extends SerializedApiItem {
	kind: ApiItemKind.Enum;
	comment: string;
}

export interface SerializedApiEnumMember extends SerializedApiItem {
	kind: ApiItemKind.EnumMember;
	comment: string;
	excerpt: SerializedExerpt;
}

export interface SerializedExerpt {
	tokens: SerializedToken[];
}

export type SerializedToken = string | SerializedReference;

export interface SerializedReference {
	path: string | null;
	name: string;
	kind: ApiItemKind;
}

export interface SerializedApiTypeAlias extends SerializedApiItem {}
