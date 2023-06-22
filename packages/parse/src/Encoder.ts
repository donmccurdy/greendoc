import { GD } from './types';
import { Parser } from './Parser';
import * as TS from 'ts-morph';
import { SortFn, createDefaultSort } from './sort';

/**
 * Encodes a serialized representation of an exported item in the API, such as
 * a class, enum, or function.
 */
export class Encoder {
	private _sort = createDefaultSort();

	encodeItem(parser: Parser, item: TS.EnumDeclaration): GD.ApiEnum;
	encodeItem(parser: Parser, item: TS.InterfaceDeclaration): GD.ApiInterface;
	encodeItem(parser: Parser, item: TS.ClassDeclaration): GD.ApiClass;
	encodeItem(parser: Parser, item: TS.EnumDeclaration): GD.ApiEnum;
	encodeItem(parser: Parser, item: TS.EnumMember): GD.ApiEnumMember;
	encodeItem(parser: Parser, item: TS.TypeAliasDeclaration): GD.ApiTypeAlias;
	encodeItem(parser: Parser, item: TS.FunctionDeclaration): GD.ApiFunction;
	encodeItem(parser: Parser, item: TS.Node): GD.ApiItem;
	encodeItem(parser: Parser, item: TS.Node): GD.ApiItem {
		switch (item.getKind()) {
			case TS.SyntaxKind.ClassDeclaration:
				return this._encodeClass(parser, item as TS.ClassDeclaration);
			case TS.SyntaxKind.InterfaceDeclaration:
				return this._encodeInterface(parser, item as TS.InterfaceDeclaration);
			case TS.SyntaxKind.EnumDeclaration:
				return this._encodeEnum(parser, item as TS.EnumDeclaration);
			case TS.SyntaxKind.FunctionDeclaration:
				return this._encodeFunction(parser, item as TS.FunctionDeclaration);
			case TS.SyntaxKind.EnumMember:
				return this._encodeEnumMember(parser, item as TS.EnumMember);
			case TS.SyntaxKind.TypeAliasDeclaration:
				return this._encodeTypeAlias(parser, item as TS.TypeAliasDeclaration) as any; // TODO(cleanup)
			case TS.SyntaxKind.PropertyDeclaration:
			case TS.SyntaxKind.MethodDeclaration:
				throw new Error(`Unexpected detached type, "${item.getKindName()}"`);
			default:
				console.log(item);
				throw new Error(`Unsupported encoded type, "${item.getKindName()}"`);
		}
	}

	setSort(sort: SortFn): this {
		this._sort = sort;
		return this;
	}

	protected _encodeItem(parser: Parser, item: TS.Node): GD.ApiItem {
		return {
			kind: this._encodeKind(item.getKind()) as any, // TODO(cleanup)
			name: (item as any).getName ? (item as any).getName() : '',
			source: {
				text: parser.getSourceText(item),
				url: parser.getSourceURL(item)
			}
		};
	}

	protected _encodeKind(kind: TS.SyntaxKind): GD.ApiItemKind {
		switch (kind) {
			case TS.SyntaxKind.ClassDeclaration:
				return GD.ApiItemKind.CLASS;
			case TS.SyntaxKind.InterfaceDeclaration:
				return GD.ApiItemKind.INTERFACE;
			case TS.SyntaxKind.EnumDeclaration:
				return GD.ApiItemKind.ENUM;
			case TS.SyntaxKind.EnumMember:
				return GD.ApiItemKind.ENUM_MEMBER;
			case TS.SyntaxKind.FunctionDeclaration:
				return GD.ApiItemKind.FUNCTION;
			case TS.SyntaxKind.MethodDeclaration:
				return GD.ApiItemKind.METHOD;
			case TS.SyntaxKind.MethodSignature:
				return GD.ApiItemKind.METHOD_SIGNATURE;
			case TS.SyntaxKind.PropertyDeclaration:
				return GD.ApiItemKind.PROPERTY;
			case TS.SyntaxKind.PropertySignature:
				return GD.ApiItemKind.PROPERTY_SIGNATURE;
			default:
				throw new Error(`SyntaxKind.${getKindName(kind)} not implemented.`);
		}
	}

	protected _encodeClass(parser: Parser, item: TS.ClassDeclaration): GD.ApiClass {
		const data = {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.getJsDocs().pop()),
			extendsTypes: [],
			staticProperties: getInheritedMembers(item, TS.SyntaxKind.PropertyDeclaration, true)
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as TS.PropertyDeclaration))
				.sort(this._sort),
			properties: getInheritedMembers(item, TS.SyntaxKind.PropertyDeclaration, false)
				.filter((prop) => prop.getScope() !== TS.Scope.Private)
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as TS.PropertyDeclaration))
				.sort(this._sort),
			staticMethods: getInheritedMembers(item, TS.SyntaxKind.MethodDeclaration, true)
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method))
				.sort(this._sort),
			methods: getInheritedMembers(item, TS.SyntaxKind.MethodDeclaration, false)
				.filter((method) => method.getScope() !== TS.Scope.Private)
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method))
				.sort(this._sort)
		} as GD.ApiClass;

		let base = item;
		while ((base = base.getBaseClass())) {
			data.extendsTypes.push(this._encodeReference(parser, base));
		}
		data.extendsTypes.reverse();

		return data;
	}

	protected _encodeInterface(parser: Parser, item: TS.InterfaceDeclaration): GD.ApiInterface {
		return {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.getJsDocs().pop()),
			extendsTypes: [], // item.extendsTypes.map(({ excerpt }) => this._encodeExcerpt(parser, excerpt)),
			properties: item
				.getProperties()
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as any))
				.sort(this._sort),
			methods: item
				.getMethods()
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method as any))
				.sort(this._sort)
		} as GD.ApiInterface;
	}

	protected _encodeEnum(parser: Parser, item: TS.EnumDeclaration): GD.ApiEnum {
		const data = {
			...this._encodeItem(parser, item),
			members: item
				.getMembers()
				.filter((item) => !parser.isHidden(item))
				.map((item) => this._encodeEnumMember(parser, item))
				.sort(this._sort)
		} as GD.ApiEnum;

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(parser, comment);

		return data;
	}
	protected _encodeFunction(parser: Parser, item: TS.FunctionDeclaration): GD.ApiFunction {
		const data = {
			...this._encodeItem(parser, item),
			kind: GD.ApiItemKind.FUNCTION,
			params: item.getParameters().map((param) => ({
				name: param.getName(),
				type: this._encodeType(parser, param.getType(), param.getTypeNode()),
				optional: param.isOptional() || undefined
			})),
			returns: this._encodeType(parser, item.getReturnType(), item.getReturnTypeNode())
		} as Partial<GD.ApiFunction>;

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(parser, comment);
		return data as GD.ApiFunction;
	}
	protected _encodeEnumMember(parser: Parser, item: TS.EnumMember): GD.ApiEnumMember {
		return {
			...this._encodeItem(parser, item),
			type: this._encodeType(parser, item.getType()),
			comment: this._encodeComment(parser, item.getJsDocs().pop())
		} as GD.ApiEnumMember;
	}
	protected _encodeTypeAlias(parser: Parser, item: TS.TypeAliasDeclaration): GD.ApiTypeAlias {
		return this._encodeItem(parser, item) as GD.ApiTypeAlias;
	}

	protected _encodeReference(parser: Parser, item: TS.Node): GD.Reference | null {
		return {
			path: parser.getPath(item),
			name: (item as any).getName ? (item as any).getName() : '',
			kind: this._encodeKind(item.getKind())
		};
	}

	protected _encodeType(parser: Parser, type: TS.Type, typeNode?: TS.TypeNode): GD.Token {
		const symbol = type.getSymbol();
		if (symbol) {
			for (const decl of symbol.getDeclarations()) {
				if (!parser.hasItem(decl)) continue;
				const ref = this._encodeReference(parser, decl);
				if (ref) return ref;
			}
		}
		if (typeNode) return typeNode.getText();
		if (type.isAnonymous()) return 'unknown';
		return type.getText();
	}

	protected _encodeComment(parser: Parser, comment?: TS.JSDoc): string {
		if (!comment) return '';

		let md = comment.getCommentText();
		if (!md) return '';

		md = md.replaceAll(/{@link ([\S]+)\s*(\S+)?\s*}/g, (_, anchorRef, anchorText) => {
			const [exportName, fragment] = anchorRef.split('.');
			const item = parser.getItemByExportName(exportName);
			const text = anchorText || anchorRef;
			const href = parser.getPath(item) + (fragment ? `#${fragment}` : '');
			return `[${text}](${href})`;
		});

		return parser.renderMarkdown(md) || '';
	}

	protected _encodeMember(
		parser: Parser,
		item: TS.MethodDeclaration | TS.MethodSignature | TS.PropertyDeclaration | TS.PropertySignature
	): GD.ApiMember {
		const data = {
			...this._encodeItem(parser, item),
			kind:
				item.getKind() === TS.SyntaxKind.MethodDeclaration
					? GD.ApiItemKind.METHOD
					: GD.ApiItemKind.PROPERTY
			// overwrite?: Reference,
		} as Partial<GD.ApiMember>;

		if (item instanceof TS.MethodDeclaration || item instanceof TS.PropertyDeclaration) {
			if (item.isStatic()) data.isStatic = true;
			if (item.getScope() === TS.Scope.Protected) data.isProtected = true;
		}

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(parser, comment);

		return data as GD.ApiMember;
	}

	protected _encodeMethod(
		parser: Parser,
		item: TS.MethodDeclaration | TS.MethodSignature
	): GD.ApiMethod {
		return {
			...this._encodeMember(parser, item),
			kind: GD.ApiItemKind.METHOD,
			params: item.getParameters().map((param) => ({
				name: param.getName(),
				type: this._encodeType(parser, param.getType(), param.getTypeNode()),
				optional: param.isOptional() || undefined
			})),
			returns: this._encodeType(parser, item.getReturnType(), item.getReturnTypeNode())
		};
	}

	protected _encodeProperty(
		parser: Parser,
		item: TS.PropertyDeclaration | TS.PropertySignature
	): GD.ApiProperty {
		return {
			...this._encodeMember(parser, item),
			kind: GD.ApiItemKind.PROPERTY,
			type: this._encodeType(parser, item.getType(), item.getTypeNode()),
			isReadonly: item.isReadonly()
		};
	}

	protected _encodeInheritedMembers<T extends GD.ApiMethod>(
		parser: Parser,
		childItem: TS.ClassDeclaration | TS.InterfaceDeclaration,
		kind: TS.SyntaxKind.MethodDeclaration
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiProperty>(
		parser: Parser,
		childItem: TS.ClassDeclaration | TS.InterfaceDeclaration,
		kind: TS.SyntaxKind.PropertyDeclaration
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiMethod | GD.ApiProperty>(
		parser: Parser,
		childItem: TS.ClassDeclaration | TS.InterfaceDeclaration,
		kind: TS.SyntaxKind.MethodDeclaration | TS.SyntaxKind.PropertyDeclaration
	): T[] {
		// (1) Obtain leaf member.
		// (2) Walk up tree until missing info resolved and a direct override found, if exists.
		// (3) Return resolved member.
		const members =
			kind === TS.SyntaxKind.MethodDeclaration ? childItem.getMethods() : childItem.getProperties();

		const encodedMembers = [] as T[];
		for (const member of members) {
			// encodedMembers.push(this._resolveInheritedMember(parser, member, null));
			encodedMembers.push(this._encodeItem(parser, member) as T);
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

	// protected _resolveInheritedMethod(
	// 	parser: Parser,
	// 	member: MethodDeclaration,
	// 	parent: ClassDeclaration,
	// 	target: Partial<GD.ApiMethod> | null
	// ): GD.ApiMethod {
	// 	const base = member instanceof ClassDeclaration ? member.getBaseClass()
	// 	const parent = member.parent as ApiClass | ApiInterface | undefined;
	// 	if (!parent) {
	// 		throw new Error(`Unexpected detached member of type "${member.kind}"`);
	// 	}

	// 	// TODO(feat): Consider how to resolve generics.

	// 	if (!target) {
	// 		target = this._encodeItem(parser, member) as Partial<T>;
	// 	} else if (target.overwrite === undefined) {
	// 		const overwrite = this._encodeReference(parser, parent.canonicalReference);
	// 		if (overwrite) target.overwrite = overwrite;
	// 	}

	// 	if (target.isStatic === undefined) {
	// 		target.isStatic = member.isStatic;
	// 	}
	// 	if (target.isProtected === undefined) {
	// 		target.isProtected = member.isProtected;
	// 	}
	// 	if (target.isOptional === undefined) {
	// 		target.isOptional = member.isOptional;
	// 	}
	// 	if (
	// 		member.kind === ApiItemKind.Property &&
	// 		(target as Partial<GD.ApiProperty>).isReadonly === undefined
	// 	) {
	// 		(target as Partial<GD.ApiProperty>).isReadonly = (member as ApiProperty).isReadonly;
	// 	}
	// 	if (target.excerpt === undefined) {
	// 		target.excerpt = this._encodeExcerpt(parser, member.excerpt);
	// 	}
	// 	if (target.comment === undefined || target.comment === '') {
	// 		target.comment = this._encodeComment(parser, member.tsdocComment);
	// 	}
	// 	if (target.sourceUrl === undefined) {
	// 		target.sourceUrl = member.sourceLocation.fileUrl;
	// 	}
	// 	if (target.sourceUrlPath === undefined) {
	// 		target.sourceUrlPath = member.fileUrlPath;
	// 	}

	// 	// TODO(feat): Consider how to include merged siblings, multiple overrides. If that's
	// 	// what we're returned by findMembersByName?
	// 	// See: member.getMergedSiblings();
	// 	const nextParent = getExtends(parser, parent);
	// 	const nextMember = nextParent?.findMembersByName(member.name)[0];
	// 	return nextMember
	// 		? this._resolveInheritedMember(parser, nextMember as ApiMethod | ApiProperty, target)
	// 		: (target as T);
	// }
}

function getInheritedMembers<T extends TS.MethodDeclaration>(
	child: TS.ClassDeclaration,
	kind: TS.SyntaxKind.MethodDeclaration,
	_static: boolean
): T[];
function getInheritedMembers<T extends TS.PropertyDeclaration>(
	child: TS.ClassDeclaration,
	kind: TS.SyntaxKind.PropertyDeclaration,
	_static: boolean
): T[];
function getInheritedMembers<T extends TS.MethodDeclaration | TS.PropertyDeclaration>(
	child: TS.ClassDeclaration,
	kind: TS.SyntaxKind.MethodDeclaration | TS.SyntaxKind.PropertyDeclaration,
	_static: boolean
): T[] {
	const members: T[] = [];
	const memberSet = new Set<string>();

	const baseMembers =
		kind === TS.SyntaxKind.MethodDeclaration ? child.getMethods() : child.getProperties();
	for (const member of baseMembers) {
		if (member.isStatic() !== _static) continue;
		memberSet.add(member.getName());
		members.push(member as T);
	}

	let current = child;
	while ((current = current.getBaseClass())) {
		const inheritedMembers =
			kind === TS.SyntaxKind.MethodDeclaration ? current.getMethods() : current.getProperties();
		for (const member of inheritedMembers) {
			if (member.isStatic() !== _static) continue;
			if (memberSet.has(member.getName())) continue;
			memberSet.add(member.getName());
			members.push(member as T);
		}
	}

	return members.sort((a, b) => (a.getName() > b.getName() ? 1 : -1));
}

let _kindNameCache: Record<number, string> | undefined;
function getKindName(kind: TS.SyntaxKind): string {
	if (!_kindNameCache) {
		_kindNameCache = {};
		for (const key in TS.SyntaxKind) {
			_kindNameCache[TS.SyntaxKind[key]] = key;
		}
	}
	return _kindNameCache[kind];
}
