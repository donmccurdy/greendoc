import { Node, Project, SourceFile, SyntaxKind } from 'ts-morph';

type $StringLike = { toString: () => string };

interface Package {
	name: string;
	entry: SourceFile;
	exports: { name: string; path: string; category?: string }[];
}

export class Parser {
	readonly project: Project;
	readonly packages: Package[] = [];
	readonly itemToSlug = new Map<Node, string>();
	readonly slugToItem = new Map<string, Node>();
	private rootPath: string = '';
	private baseURL: string = '';

	constructor(project = new Project()) {
		this.project = project;
	}

	public init(): this {
		for (const pkg of this.packages) {
			const pkgSlug = pkg.name.split('/').pop();
			for (const [name, declarations] of pkg.entry.getExportedDeclarations()) {
				for (const declaration of declarations) {
					const slug = `${pkgSlug}.${name}.html`;
					this.itemToSlug.set(declaration, slug);
					this.slugToItem.set(slug, declaration);
					const path = this.getPath(declaration);
					if (path) {
						pkg.exports.push({ name, path });
					} else {
						console.warn(`No path for export, "${name}".`);
					}
				}
			}
		}
		return this;
	}

	public setRootPath(path: string) {
		this.rootPath = path;
	}

	public setBaseURL(url: string) {
		this.baseURL = url;
	}

	public addPackageFromFile(name: string, sourceFile: SourceFile): this {
		this.packages.push({
			name,
			entry: sourceFile,
			exports: []
		});
		return this;
	}

	public addPackageFromPath(name: string, entryPath: string): this {
		this.packages.push({
			name,
			entry: this.project.addSourceFileAtPath(entryPath),
			exports: []
		});
		return this;
	}

	/** @internal */
	getItemBySlug(slug: string): Node {
		const item = this.slugToItem.get(slug);
		if (item) return item;
		throw new Error(`Item for "${slug}" not found`);
	}

	/** @internal */
	hasItem(item: Node): boolean {
		return this.itemToSlug.has(item);
	}

	/** @internal */
	getSlug(item: Node): string {
		const slug = this.itemToSlug.get(item);
		if (slug) return slug;
		throw new Error(`Slug for "${item.toString()}" not found`);
	}

	// TODO(design): URL paths should be an application-level decision.
	/** @internal */
	getPath(item: Node): string | null {
		switch (item.getKind()) {
			case SyntaxKind.ClassDeclaration:
				return `/classes/${this.getSlug(item)}`;
			case SyntaxKind.InterfaceDeclaration:
				return `/interfaces/${this.getSlug(item)}`;
			case SyntaxKind.EnumDeclaration:
				return `/enums/${this.getSlug(item)}`;
			case SyntaxKind.FunctionDeclaration:
				return `/functions/${this.getSlug(item)}`;
			// case SyntaxKind.VariableDeclaration:
			// 	return `/constants/${this.getSlug(item)}`;
			default:
				return null;
		}
	}

	getSourceText(item: Node): string {
		return item.getSourceFile().getBaseName();
	}

	getSourceURL(item: Node): string {
		return item.getSourceFile().getFilePath();
	}
}
