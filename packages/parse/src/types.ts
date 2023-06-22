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
		METHOD_SIGNATURE = 'MethodSignature',
		PROPERTY = 'Property',
		PROPERTY_SIGNATURE = 'PropertySignature'
	}

	export type ApiItem =
		| ApiClass
		| ApiInterface
		| ApiFunction
		| ApiMember
		| ApiMethod
		| ApiEnum
		| ApiEnumMember;

	export interface ApiItemBase {
		name: string;
		kind: ApiItemKind;
		source?: Source;
	}

	export interface ApiClass extends ApiItemBase {
		// TODO: resolved & unresolved generics?
		// TODO: interfaces implemented?
		kind: ApiItemKind.CLASS;
		comment?: string; // → IntlText
		extendsTypes: Reference[];
		properties: ApiProperty[];
		methods: ApiMethod[];
		// TODO: overloads?
		staticProperties: ApiProperty[];
		staticMethods: ApiMethod[];
	}

	export interface ApiInterface extends ApiItemBase {
		kind: ApiItemKind.INTERFACE;
		comment?: string;
		extendsTypes: Reference[];
		properties: ApiProperty[];
		methods: ApiMethod[];
	}

	export interface ApiFunction extends ApiItemBase {
		kind: ApiItemKind.FUNCTION;
		comment?: string;
		params: ApiParameter[];
		returns: ApiReturnType;
	}

	export interface ApiMember extends ApiItemBase {
		kind: ApiItemKind.METHOD | ApiItemKind.PROPERTY;
		isStatic?: boolean;
		isProtected?: boolean;
		isOptional?: boolean;
		overwrite?: Reference;
		comment?: string;
	}

	export interface ApiMethod extends ApiMember {
		kind: ApiItemKind.METHOD;
		params: ApiParameter[];
		returns: ApiReturnType;
	}

	export type ApiParameter = {
		name: string;
		type?: Token;
		optional?: boolean;
	};

	export type ApiReturnType = Token;

	export interface ApiProperty extends ApiMember {
		kind: ApiItemKind.PROPERTY;
		type?: Token;
		isReadonly: boolean;
	}

	export interface ApiEnum extends ApiItemBase {
		kind: ApiItemKind.ENUM;
		members: ApiEnumMember[];
		comment?: string;
	}

	export interface ApiEnumMember extends ApiItemBase {
		kind: ApiItemKind.ENUM_MEMBER;
		type?: Token;
		comment?: string;
	}

	export type Token = string | Reference;

	export interface Reference {
		name: string;
		kind: ApiItemKind;
		path?: string;
	}

	export interface Source {
		text: string;
		url: string;
	}

	export interface ApiTypeAlias extends ApiItemBase {}
}
