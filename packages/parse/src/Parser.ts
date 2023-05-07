import { Node, Project, SourceFile, SyntaxKind } from 'ts-morph';

type $StringLike = { toString: () => string };

interface Package {
	name: string;
	entry: SourceFile;
	exports: { name: string; path: string; category?: string }[];
}

export class Parser {
	readonly project = new Project();
	readonly packages: Package[] = [];
	readonly itemToSlug = new Map<Node, string>();
	readonly slugToItem = new Map<string, Node>();
	readonly canonicalReferenceToItem = new Map<string, Node>();

	public init(): this {
		console.log('BEGIN INIT');
		console.time('init');
		for (const pkg of this.packages) {
			const pkgSlug = pkg.name.split('/').pop();
			for (const member of pkg.entry.getClasses()) {
				console.log(member);
			}
			for (const [name, declarations] of pkg.entry.getExportedDeclarations()) {
				for (const declaration of declarations) {
					const slug = `${pkgSlug}.${name}.html`;
					this.itemToSlug.set(declaration, slug);
					this.slugToItem.set(slug, declaration);
					const path = this.getPath(declaration);
					if (path) {
						pkg.exports.push({ name, path });
					} else {
						console.log(`No path for slug ${slug}`);
					}
				}
			}
		}
		console.timeEnd('init');
		return this;
	}

	public addPackage(name: string, entryPath: string): this {
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

	// /** @internal */
	// getItemByCanonicalReference(canonicalReference: $StringLike): Node | null {
	// 	return this.canonicalReferenceToItem.get(canonicalReference.toString()) || null;
	// }

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
