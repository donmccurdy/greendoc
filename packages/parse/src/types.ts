// TODO(design): Clean up API from an end-user perspective.
export namespace GD {
	// export enum ApiExportKind {
	// 	CLASS = 'Class',
	// 	INTERFACE = 'Interface',
	// 	ENUM = 'Enum',
	// 	FUNCTION = 'Function',
	// 	VARIABLE = 'Variable'
	// }

	export enum ApiItemKind {
		CLASS = 'Class',
		INTERFACE = 'Interface',
		ENUM = 'Enum',
		ENUM_MEMBER = 'EnumMember',
		FUNCTION = 'Function',
		VARIABLE = 'Variable',
		METHOD = 'Method',
		PROPERTY = 'Property'
	}

	export interface ApiItem {
		name: string;
		kind: ApiItemKind;
		source?: Source;
	}

	export interface ApiClass extends ApiItem {
		// TODO: resolved & unresolved generics?
		// TODO: interfaces implemented?
		kind: ApiItemKind.CLASS;
		comment: string; // → IntlText
		extendsTypes: Reference[];
		properties: ApiProperty[];
		methods: ApiMethod[];
		// TODO: overloads?
		staticProperties: ApiProperty[];
		staticMethods: ApiMethod[];
	}

	export interface ApiInterface extends ApiItem {
		kind: ApiItemKind.INTERFACE;
		comment: string;
		extendsTypes: Reference[];
		properties: ApiProperty[];
		methods: ApiMethod[];
	}

	export interface ApiMember extends ApiItem {
		kind: ApiItemKind.METHOD | ApiItemKind.PROPERTY;
		isStatic: boolean;
		isProtected: boolean;
		isOptional: boolean;
		overwrite?: Reference;
		comment: string;
	}

	export interface ApiMethod extends ApiMember {
		kind: ApiItemKind.METHOD;
		params: ApiMethodParam[];
		returns: ApiMethodReturnType;
	}

	export type ApiMethodParam = {
		name: string;
		type?: Token;
		optional?: boolean;
	};

	export type ApiMethodReturnType = Token;

	export interface ApiProperty extends ApiMember {
		kind: ApiItemKind.PROPERTY;
		type?: Token;
		isReadonly: boolean;
	}

	export interface ApiEnum extends ApiItem {
		kind: ApiItemKind.ENUM;
		comment: string;
	}

	export interface ApiEnumMember extends ApiItem {
		kind: ApiItemKind.ENUM_MEMBER;
		comment: string;
	}

	export type Token = string | Reference;

	export interface Reference {
		path: string | null;
		name: string;
		kind: ApiItemKind;
	}

	export interface Source {
		text: string;
		url: string;
	}

	export interface ApiTypeAlias extends ApiItem {}
}
