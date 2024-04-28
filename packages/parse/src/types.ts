// TODO(design): Clean up API from an end-user perspective.
// TODO(design): Consider reading through the ECMAScript type annotations proposal,
// and fitting this design to its goals. If a feature is supported in TypeScript but
// not in JavaScript, I might consider omitting it here.
// TODO(design): Consider removing 'Api' prefix.
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
		CONSTRUCTOR = 'Constructor',
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
		| ApiEnumMember
		| ApiVariable;

	export interface ApiItemBase {
		name: string;
		kind: ApiItemKind;
		source?: Source;
		tags?: Record<string, string | true>;
	}

	export interface ApiClass extends ApiItemBase {
		// TODO: resolved & unresolved generics?
		// TODO: interfaces implemented?
		kind: ApiItemKind.CLASS;
		comment?: string; // → IntlText
		extendsTypes: Reference[];
		constructor?: ApiConstructor;
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
		returnsComment?: string;
	}

	export interface ApiMember extends ApiItemBase {
		kind: ApiItemKind.CONSTRUCTOR | ApiItemKind.METHOD | ApiItemKind.PROPERTY;
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
		returnsComment?: string;
	}

	export type ApiParameter = {
		name: string;
		type?: Token;
		optional?: boolean;
	};

	export type ApiReturnType = Token;

	export interface ApiConstructor extends ApiMember {
		kind: ApiItemKind.CONSTRUCTOR;
		isStatic: false;
		name: 'constructor';
		params: ApiParameter[];
		returns: ApiReturnType;
	}

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

	export interface ApiVariable extends ApiItemBase {
		type?: Token;
		comment?: string; // not yet supported by ts-morph
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
