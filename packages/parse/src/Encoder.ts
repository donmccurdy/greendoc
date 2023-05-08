import { renderMarkdown } from './format';
import { GD } from './types';
import { Parser } from './Parser';
import {
	ClassDeclaration,
	EnumDeclaration,
	EnumMember,
	FunctionDeclaration,
	InterfaceDeclaration,
	JSDoc,
	MethodDeclaration,
	MethodSignature,
	Node,
	PropertyDeclaration,
	PropertySignature,
	Scope,
	SyntaxKind,
	Type,
	TypeAliasDeclaration,
	TypeNode
} from 'ts-morph';

// // TODO(feat): Sort results.
export class Encoder {
	encodeItem(parser: Parser, item: EnumDeclaration): GD.ApiEnum;
	encodeItem(parser: Parser, item: InterfaceDeclaration): GD.ApiInterface;
	encodeItem(parser: Parser, item: ClassDeclaration): GD.ApiClass;
	encodeItem(parser: Parser, item: EnumDeclaration): GD.ApiEnum;
	encodeItem(parser: Parser, item: EnumMember): GD.ApiEnumMember;
	encodeItem(parser: Parser, item: TypeAliasDeclaration): GD.ApiTypeAlias;
	encodeItem(parser: Parser, item: Node): GD.ApiItem {
		switch (item.getKind()) {
			case SyntaxKind.ClassDeclaration:
				return this._encodeClass(parser, item as ClassDeclaration);
			case SyntaxKind.InterfaceDeclaration:
				return this._encodeInterface(parser, item as InterfaceDeclaration);
			case SyntaxKind.EnumDeclaration:
				return this._encodeEnum(parser, item as EnumDeclaration);
			case SyntaxKind.FunctionDeclaration:
				return this._encodeFunction(parser, item as FunctionDeclaration);
			case SyntaxKind.EnumMember:
				return this._encodeEnumMember(parser, item as EnumMember);
			case SyntaxKind.TypeAliasDeclaration:
				return this._encodeTypeAlias(parser, item as TypeAliasDeclaration);
			case SyntaxKind.PropertyDeclaration:
			case SyntaxKind.MethodDeclaration:
				throw new Error(`Unexpected detached type, "${item.getKindName()}"`);
			default:
				console.log(item);
				throw new Error(`Unsupported encoded type, "${item.getKindName()}"`);
		}
	}

	protected _encodeItem(parser: Parser, item: Node): GD.ApiItem {
		return {
			kind: this._encodeKind(item.getKind()),
			name: (item as any).getName ? (item as any).getName() : '',
			source: {
				text: parser.getSourceText(item),
				url: parser.getSourceURL(item)
			}
		};
	}

	protected _encodeKind(kind: SyntaxKind): GD.ApiItemKind {
		switch (kind) {
			case SyntaxKind.ClassDeclaration:
				return GD.ApiItemKind.CLASS;
			case SyntaxKind.InterfaceDeclaration:
				return GD.ApiItemKind.INTERFACE;
			case SyntaxKind.EnumDeclaration:
				return GD.ApiItemKind.ENUM;
			case SyntaxKind.EnumMember:
				return GD.ApiItemKind.ENUM_MEMBER;
			case SyntaxKind.FunctionDeclaration:
				return GD.ApiItemKind.FUNCTION;
			case SyntaxKind.MethodDeclaration:
				return GD.ApiItemKind.METHOD;
			case SyntaxKind.MethodSignature:
				return GD.ApiItemKind.METHOD_SIGNATURE;
			case SyntaxKind.PropertyDeclaration:
				return GD.ApiItemKind.PROPERTY;
			case SyntaxKind.PropertySignature:
				return GD.ApiItemKind.PROPERTY_SIGNATURE;
			default:
				throw new Error(`SyntaxKind.${getKindName(kind)} not implemented.`);
		}
	}

	protected _encodeClass(parser: Parser, item: ClassDeclaration): GD.ApiClass {
		const data = {
			...this._encodeItem(parser, item),
			comment: this._encodeComment(parser, item.getJsDocs().pop()),
			extendsTypes: [],
			staticProperties: item
				.getStaticProperties()
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as PropertyDeclaration)),
			properties: getInheritedInstanceMembers(item, SyntaxKind.PropertyDeclaration)
				.filter((prop) => prop.getScope() !== Scope.Private)
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as PropertyDeclaration)),
			staticMethods: item
				.getStaticMethods()
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method)),
			methods: getInheritedInstanceMembers(item, SyntaxKind.MethodDeclaration)
				.filter((method) => method.getScope() !== Scope.Private)
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method))
		} as GD.ApiClass;

		let base = item;
		while ((base = base.getBaseClass())) {
			data.extendsTypes.push(this._encodeReference(parser, base));
		}
		data.extendsTypes.reverse();

		return data;
	}

	protected _encodeInterface(parser: Parser, item: InterfaceDeclaration): GD.ApiInterface {
		return {
			...this._encodeItem(parser, item),
			path: parser.getPath(item),
			packageName: '', // item.getAssociatedPackage()!.name,
			comment: this._encodeComment(parser, item.getJsDocs().pop()),
			extendsTypes: [], // item.extendsTypes.map(({ excerpt }) => this._encodeExcerpt(parser, excerpt)),
			properties: item
				.getProperties()
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(parser, prop as any)),
			methods: item
				.getMethods()
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(parser, method as any))
		} as GD.ApiInterface;
	}

	protected _encodeEnum(parser: Parser, item: EnumDeclaration): GD.ApiEnum {
		const data = {
			...this._encodeItem(parser, item),
			members: item
				.getMembers()
				.filter((item) => !parser.isHidden(item))
				.map((item) => this._encodeEnumMember(parser, item))
		} as GD.ApiEnum;

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(parser, comment);

		return data;
	}
	protected _encodeFunction(parser: Parser, item: FunctionDeclaration): GD.ApiFunction {
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
	protected _encodeEnumMember(parser: Parser, item: EnumMember): GD.ApiEnumMember {
		return {
			...this._encodeItem(parser, item),
			type: this._encodeType(parser, item.getType()),
			comment: this._encodeComment(parser, item.getJsDocs().pop())
		} as GD.ApiEnumMember;
	}
	protected _encodeTypeAlias(parser: Parser, item: TypeAliasDeclaration): GD.ApiTypeAlias {
		return this._encodeItem(parser, item) as GD.ApiTypeAlias;
	}

	protected _encodeReference(parser: Parser, item: Node): GD.Reference | null {
		return {
			path: parser.getPath(item),
			name: (item as any).getName ? (item as any).getName() : '',
			kind: this._encodeKind(item.getKind())
		};
	}

	protected _encodeType(parser: Parser, type: Type, typeNode?: TypeNode): GD.Token {
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

	protected _encodeComment(parser: Parser, comment?: JSDoc): string {
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

		return renderMarkdown(md) || '';
	}

	protected _encodeMember(
		parser: Parser,
		item: MethodDeclaration | MethodSignature | PropertyDeclaration | PropertySignature
	): GD.ApiMember {
		const data = {
			...this._encodeItem(parser, item),
			kind:
				item.getKind() === SyntaxKind.MethodDeclaration
					? GD.ApiItemKind.METHOD
					: GD.ApiItemKind.PROPERTY
			// overwrite?: Reference,
		} as Partial<GD.ApiMember>;

		if (item instanceof MethodDeclaration || item instanceof PropertyDeclaration) {
			if (item.isStatic()) data.isStatic = true;
			if (item.getScope() === Scope.Protected) data.isProtected = true;
		}

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(parser, comment);

		return data as GD.ApiMember;
	}

	protected _encodeMethod(parser: Parser, item: MethodDeclaration | MethodSignature): GD.ApiMethod {
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
		item: PropertyDeclaration | PropertySignature
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
		childItem: ClassDeclaration | InterfaceDeclaration,
		kind: SyntaxKind.MethodDeclaration
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiProperty>(
		parser: Parser,
		childItem: ClassDeclaration | InterfaceDeclaration,
		kind: SyntaxKind.PropertyDeclaration
	): T[];
	protected _encodeInheritedMembers<T extends GD.ApiMethod | GD.ApiProperty>(
		parser: Parser,
		childItem: ClassDeclaration | InterfaceDeclaration,
		kind: SyntaxKind.MethodDeclaration | SyntaxKind.PropertyDeclaration
	): T[] {
		// (1) Obtain leaf member.
		// (2) Walk up tree until missing info resolved and a direct override found, if exists.
		// (3) Return resolved member.
		const members =
			kind === SyntaxKind.MethodDeclaration ? childItem.getMethods() : childItem.getProperties();

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

function getInheritedInstanceMembers<T extends MethodDeclaration>(
	child: ClassDeclaration,
	kind: SyntaxKind.MethodDeclaration
): T[];
function getInheritedInstanceMembers<T extends PropertyDeclaration>(
	child: ClassDeclaration,
	kind: SyntaxKind.PropertyDeclaration
): T[];
function getInheritedInstanceMembers<T extends MethodDeclaration | PropertyDeclaration>(
	child: ClassDeclaration,
	kind: SyntaxKind.MethodDeclaration | SyntaxKind.PropertyDeclaration
): T[] {
	const members: T[] = [];
	const memberSet = new Set<string>();

	for (const member of kind === SyntaxKind.MethodDeclaration
		? child.getMethods()
		: child.getProperties()) {
		memberSet.add(member.getName());
		members.push(member as T);
	}

	let current = child;
	while ((current = current.getBaseClass())) {
		for (const member of kind === SyntaxKind.MethodDeclaration
			? current.getMethods()
			: current.getProperties()) {
			if (memberSet.has(member.getName())) continue;
			memberSet.add(member.getName());
			members.push(member as T);
		}
	}

	return members.sort((a, b) => (a.getName() > b.getName() ? 1 : -1));
}

let _kindNameCache: Record<number, string> | undefined;
function getKindName(kind: SyntaxKind): string {
	if (!_kindNameCache) {
		_kindNameCache = {};
		for (const key in SyntaxKind) {
			_kindNameCache[SyntaxKind[key]] = key;
		}
	}
	return _kindNameCache[kind];
}
