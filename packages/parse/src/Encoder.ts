import { GD } from './types';
import { Parser } from './Parser';
import * as TS from 'ts-morph';
import { SortFn, createDefaultSort } from './utils/sort';

/**
 * Encodes a serialized representation of an exported item in the API, such as
 * a class, enum, or function.
 */
export class Encoder {
	private _sort = createDefaultSort();
	private readonly _parser: Parser;

	/**
	 * Creates a reusable Encoder instance, bound to the given {@link Parser}.
	 */
	constructor(parser: Parser) {
		this._parser = parser;
	}

	encodeItem(item: TS.EnumDeclaration): GD.ApiEnum;
	encodeItem(item: TS.InterfaceDeclaration): GD.ApiInterface;
	encodeItem(item: TS.ClassDeclaration): GD.ApiClass;
	encodeItem(item: TS.EnumDeclaration): GD.ApiEnum;
	encodeItem(item: TS.EnumMember): GD.ApiEnumMember;
	encodeItem(item: TS.TypeAliasDeclaration): GD.ApiTypeAlias;
	encodeItem(item: TS.FunctionDeclaration): GD.ApiFunction;
	encodeItem(item: TS.Node): GD.ApiItem;
	encodeItem(item: TS.Node): GD.ApiItem {
		switch (item.getKind()) {
			case TS.SyntaxKind.ClassDeclaration:
				return this._encodeClass(item as TS.ClassDeclaration);
			case TS.SyntaxKind.InterfaceDeclaration:
				return this._encodeInterface(item as TS.InterfaceDeclaration);
			case TS.SyntaxKind.EnumDeclaration:
				return this._encodeEnum(item as TS.EnumDeclaration);
			case TS.SyntaxKind.FunctionDeclaration:
				return this._encodeFunction(item as TS.FunctionDeclaration);
			case TS.SyntaxKind.EnumMember:
				return this._encodeEnumMember(item as TS.EnumMember);
			case TS.SyntaxKind.TypeAliasDeclaration:
				return this._encodeTypeAlias(item as TS.TypeAliasDeclaration) as any; // TODO(cleanup)
			case TS.SyntaxKind.PropertyDeclaration:
			case TS.SyntaxKind.MethodDeclaration:
				throw new Error(`Unexpected detached type, "${item.getKindName()}"`);
			case TS.SyntaxKind.VariableDeclaration:
				return this._encodeVariable(item as TS.VariableDeclaration);
			default:
				console.log(item);
				throw new Error(`Unsupported encoded type, "${item.getKindName()}"`);
		}
	}

	setSort(sort: SortFn): this {
		this._sort = sort;
		return this;
	}

	protected _encodeItem(item: TS.Node): GD.ApiItem {
		return {
			kind: this._encodeKind(item.getKind()) as any, // TODO(cleanup)
			name: (item as any).getName ? (item as any).getName() : '',
			source: {
				text: this._parser.getSourceText(item),
				url: this._parser.getSourceURL(item)
			},
			tags: this._parser.getTags(item) || undefined
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
			case TS.SyntaxKind.Constructor:
			case TS.SyntaxKind.ConstructSignature:
				return GD.ApiItemKind.CONSTRUCTOR;
			case TS.SyntaxKind.MethodDeclaration:
				return GD.ApiItemKind.METHOD;
			case TS.SyntaxKind.MethodSignature:
				return GD.ApiItemKind.METHOD_SIGNATURE;
			case TS.SyntaxKind.PropertyDeclaration:
				return GD.ApiItemKind.PROPERTY;
			case TS.SyntaxKind.PropertySignature:
				return GD.ApiItemKind.PROPERTY_SIGNATURE;
			case TS.SyntaxKind.VariableDeclaration:
				return GD.ApiItemKind.VARIABLE;
			default:
				throw new Error(`SyntaxKind.${getKindName(kind)} not implemented.`);
		}
	}

	protected _encodeClass(item: TS.ClassDeclaration): GD.ApiClass {
		const parser = this._parser;
		const constructor = getInheritedConstructor(item);
		const data = {
			...this._encodeItem(item),
			comment: this._encodeComment(item.getJsDocs().pop()),
			extendsTypes: [],
			constructor: constructor ? this._encodeConstructor(constructor, item) : undefined,
			staticProperties: getInheritedMembers(item, TS.SyntaxKind.PropertyDeclaration, true)
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(prop as TS.PropertyDeclaration))
				.sort(this._sort),
			properties: getInheritedMembers(item, TS.SyntaxKind.PropertyDeclaration, false)
				.filter((prop) => prop.getScope() !== TS.Scope.Private)
				.filter((prop) => !parser.isHidden(prop))
				.map((prop) => this._encodeProperty(prop as TS.PropertyDeclaration))
				.sort(this._sort),
			staticMethods: getInheritedMembers(item, TS.SyntaxKind.MethodDeclaration, true)
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(method))
				.sort(this._sort),
			methods: getInheritedMembers(item, TS.SyntaxKind.MethodDeclaration, false)
				.filter((method) => method.getScope() !== TS.Scope.Private)
				.filter((method) => !parser.isHidden(method))
				.map((method) => this._encodeMethod(method))
				.sort(this._sort)
		} as GD.ApiClass;

		let base = item;
		while ((base = base.getBaseClass())) {
			data.extendsTypes.push(this._encodeReference(base));
		}
		data.extendsTypes.reverse();

		return data;
	}

	protected _encodeInterface(item: TS.InterfaceDeclaration): GD.ApiInterface {
		return {
			...this._encodeItem(item),
			comment: this._encodeComment(item.getJsDocs().pop()),
			extendsTypes: [], // item.extendsTypes.map(({ excerpt }) => this._encodeExcerpt(excerpt)),
			properties: item
				.getProperties()
				.filter((prop) => !this._parser.isHidden(prop))
				.map((prop) => this._encodeProperty(prop as any))
				.sort(this._sort),
			methods: item
				.getMethods()
				.filter((method) => !this._parser.isHidden(method))
				.map((method) => this._encodeMethod(method as any))
				.sort(this._sort)
		} as GD.ApiInterface;
	}

	protected _encodeEnum(item: TS.EnumDeclaration): GD.ApiEnum {
		const data = {
			...this._encodeItem(item),
			members: item
				.getMembers()
				.filter((item) => !this._parser.isHidden(item))
				.map((item) => this._encodeEnumMember(item))
				.sort(this._sort)
		} as GD.ApiEnum;

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(comment);

		return data;
	}
	protected _encodeFunction(item: TS.FunctionDeclaration): GD.ApiFunction {
		const comment = item.getJsDocs().pop();
		const data = {
			...this._encodeItem(item),
			kind: GD.ApiItemKind.FUNCTION,
			params: item.getParameters().map((param) => ({
				name: param.getName(),
				type: this._encodeType(param.getType(), param.getTypeNode()),
				comment: comment ? this._encodeParamComment(comment, param.getName()) : undefined,
				optional: param.isOptional() || undefined
			})),
			returns: this._encodeType(item.getReturnType(), item.getReturnTypeNode()),
			returnsComment: comment ? this._encodeReturnsComment(comment) : undefined
		} as Partial<GD.ApiFunction>;

		if (comment) data.comment = this._encodeComment(comment);

		return data as GD.ApiFunction;
	}
	protected _encodeEnumMember(item: TS.EnumMember): GD.ApiEnumMember {
		return {
			...this._encodeItem(item),
			type: this._encodeType(item.getType()),
			comment: this._encodeComment(item.getJsDocs().pop())
		} as GD.ApiEnumMember;
	}
	protected _encodeTypeAlias(item: TS.TypeAliasDeclaration): GD.ApiTypeAlias {
		return this._encodeItem(item) as GD.ApiTypeAlias;
	}

	protected _encodeVariable(item: TS.VariableDeclaration): GD.ApiVariable {
		return {
			...this._encodeItem(item),
			type: this._encodeType(item.getType())
		};
	}

	protected _encodeReference(item: TS.Node): GD.Reference | null {
		return {
			path: this._parser.getPath(item),
			name: (item as any).getName ? (item as any).getName() : '',
			kind: this._encodeKind(item.getKind())
		};
	}

	protected _encodeType(type: TS.Type, typeNode?: TS.TypeNode): GD.Token {
		const symbol = type.getSymbol();
		if (symbol) {
			for (const decl of symbol.getDeclarations()) {
				if (!this._parser.hasItem(decl)) continue;
				const ref = this._encodeReference(decl);
				if (ref) return ref;
			}
		}
		if (typeNode) return typeNode.getText();
		if (type.isAnonymous()) return 'unknown';
		return type.getText();
	}

	protected _encodeComment(comment?: TS.JSDoc): string {
		if (!comment) return '';

		let md = comment.getCommentText();
		if (!md) return '';

		md = md.replaceAll(/{@link ([\S]+)\s*(\S+)?\s*}/g, (_, anchorRef, anchorText) => {
			const [exportName, fragment] = anchorRef.split('.');
			const item = this._parser.getItemByExportName(exportName);
			const text = anchorText || anchorRef;
			const href = this._parser.getPath(item) + (fragment ? `#${fragment}` : '');
			return `[${text}](${href})`;
		});

		return this._parser.renderMarkdown(md) || '';
	}

	protected _encodeParamComment(comment: TS.JSDoc, name: string): string | undefined {
		for (const tag of comment.getTags()) {
			const tagName = tag.getTagName();
			if (tagName === 'param' || tagName === 'arg' || tagName === 'argument') {
				const paramTag = tag as TS.JSDocParameterTag;
				if (paramTag.getName() === name) {
					return this._encodeComment(paramTag as unknown as TS.JSDoc);
				}
			}
		}
		return undefined;
	}

	protected _encodeReturnsComment(comment?: TS.JSDoc): string | undefined {
		for (const tag of comment.getTags()) {
			const tagName = tag.getTagName();
			if (tagName === 'returns' || tagName === 'return') {
				return this._encodeComment(tag as unknown as TS.JSDoc);
			}
		}
		return undefined;
	}

	protected _encodeMember(
		item:
			| TS.ConstructorDeclaration
			| TS.MethodDeclaration
			| TS.MethodSignature
			| TS.PropertyDeclaration
			| TS.PropertySignature
	): Omit<GD.ApiMember, 'kind'> {
		const data = {
			...this._encodeItem(item)
			// overwrite?: Reference,
		} as Partial<GD.ApiMember>;

		if (item instanceof TS.MethodDeclaration || item instanceof TS.PropertyDeclaration) {
			if (item.isStatic()) data.isStatic = true;
			if (item.getScope() === TS.Scope.Protected) data.isProtected = true;
		}

		const comment = item.getJsDocs().pop();
		if (comment) data.comment = this._encodeComment(comment);

		return data as GD.ApiMember;
	}

	protected _encodeConstructor(
		item: TS.ConstructorDeclaration,
		parent: TS.ClassDeclaration
	): GD.ApiConstructor {
		return {
			...this._encodeMember(item),
			kind: GD.ApiItemKind.CONSTRUCTOR,
			isStatic: undefined,
			name: 'constructor',
			params: item.getParameters().map((param) => ({
				name: param.getName(),
				type: this._encodeType(param.getType(), param.getTypeNode()),
				optional: param.isOptional() || undefined
			})),
			returns: this._encodeType(parent.getType())
		};
	}

	protected _encodeMethod(item: TS.MethodDeclaration | TS.MethodSignature): GD.ApiMethod {
		const comment = item.getJsDocs().pop();
		return {
			...this._encodeMember(item),
			kind: GD.ApiItemKind.METHOD,
			params: item.getParameters().map((param) => ({
				name: param.getName(),
				type: this._encodeType(param.getType(), param.getTypeNode()),
				comment: comment ? this._encodeParamComment(comment, param.getName()) : undefined,
				optional: param.isOptional() || undefined
			})),
			returns: this._encodeType(item.getReturnType(), item.getReturnTypeNode()),
			returnsComment: comment ? this._encodeReturnsComment(comment) : undefined
		};
	}

	protected _encodeProperty(item: TS.PropertyDeclaration | TS.PropertySignature): GD.ApiProperty {
		return {
			...this._encodeMember(item),
			kind: GD.ApiItemKind.PROPERTY,
			type: this._encodeType(item.getType(), item.getTypeNode()),
			isReadonly: item.isReadonly()
		};
	}
}

function getInheritedConstructor(child: TS.ClassDeclaration): TS.ConstructorDeclaration | null {
	// TODO: Traverse inheritance tree.
	return child.getConstructors()[0] || null;
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
