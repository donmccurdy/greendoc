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
		STATIC_METHOD = 'StaticMethod',
		PROPERTY = 'Property',
		STATIC_PROPERTY = 'StaticProperty'
	}

	export interface ApiItem {
		name: string;
		kind: ApiItemKind;
	}

	export interface ApiClass extends ApiItem {
		// TODO: resolved & unresolved generics?
		// TODO: interfaces implemented?
		kind: ApiItemKind.CLASS;
		path: string | null;
		packageName: string; // → package
		comment: string; // → IntlText
		sourceUrl: string; // remove
		sourceUrlPath: string; // → sourcePath
		// extendsType: Excerpt | null; // → extends;
		// TODO: hierarchy (up/down)
		properties: ApiProperty[];
		methods: ApiMethod[];
		// TODO: overloads?
		staticProperties: ApiProperty[];
		staticMethods: ApiMethod[];
	}

	export interface ApiInterface extends ApiItem {
		kind: ApiItemKind.INTERFACE;
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
		kind: ApiItemKind.METHOD;
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
		kind: ApiItemKind.ENUM;
		comment: string;
		sourceUrl: string;
		sourceUrlPath: string;
	}

	export interface ApiEnumMember extends ApiItem {
		kind: ApiItemKind.ENUM_MEMBER;
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
