import * as TS from 'ts-morph';
import { markedFormatter } from './utils/format';
import { SUPPORTED_TAGS } from './constants';

type $StringLike = { toString: () => string };

interface Module {
	name: string;
	slug: string;
	rootDirectory: string;
	entry: TS.SourceFile;
}

export interface ModuleConfig {
	name: string;
	slug: string;
	entry: TS.SourceFile | string;
}

export class Parser {
	readonly project: TS.Project;
	readonly modules: Module[] = [];
	readonly itemToSlug = new Map<TS.Node, string>();
	readonly slugToItem = new Map<string, TS.Node>();
	readonly exportToItem = new Map<string, TS.Node>();
	// TODO(design): Clarify if/that this is a URL path, not a path on disk.
	private rootPath: string = '';
	private baseURL: string = '';
	private formatter: (md: string) => string = markedFormatter;

	constructor(project = new TS.Project()) {
		this.project = project;
	}

	public init(): this {
		return this;
	}

	public setRootPath(path: string) {
		this.rootPath = path;
		return this;
	}

	public setBaseURL(url: string) {
		this.baseURL = url;
		return this;
	}

	public setMarkdownRenderer(formatter: ((md: string) => string) | null): this {
		this.formatter = formatter || markedFormatter;
		return this;
	}

	public addModule(config: ModuleConfig): this {
		let entry: TS.SourceFile;
		if (config.entry instanceof TS.SourceFile) {
			entry = config.entry;
		} else {
			entry = this.project.addSourceFileAtPath(config.entry);
		}

		const module: Module = {
			name: config.name,
			slug: config.slug,
			rootDirectory: fs.dirname(entry.getFilePath()),
			entry: entry
		};
		this.modules.push(module);

		for (const [name, items] of module.entry.getExportedDeclarations()) {
			for (const item of items) {
				if (this.isHidden(item)) continue;

				const slug = name;
				this.itemToSlug.set(item, slug);
				this.slugToItem.set(slug, item);
				this.exportToItem.set(name, item);
			}
		}
		return this;
	}

	public getModuleExports(name: string): TS.Node[] {
		const module = this.modules.find((module) => module.name === name);
		const exports = [];
		for (const [name, items] of module.entry.getExportedDeclarations()) {
			for (const item of items) {
				if (this.isHidden(item)) continue;
				exports.push(item);
			}
		}
		return exports;
	}

	/** @internal */
	getItemBySlug(slug: string): TS.Node {
		const item = this.slugToItem.get(slug);
		if (item) return item;
		throw new Error(`Item for "${slug}" not found`);
	}

	/** @internal */
	getItemByExportName(name: string): TS.Node {
		const item = this.exportToItem.get(name);
		if (item) return item;
		throw new Error(`Item for "${name}" not found`);
	}

	/** @internal */
	hasItem(item: TS.Node): boolean {
		return this.itemToSlug.has(item);
	}

	/** @internal */
	getSlug(item: TS.Node): string {
		const slug = this.itemToSlug.get(item);
		if (slug) return slug;

		throw new Error(
			`Slug for "${item.getKindName()}" from "${item.getSourceFile().getBaseName()}" not found`
		);
	}

	// TODO(design): URL paths should be an application-level decision.
	/** @internal */
	getPath(item: TS.Node): string | null {
		const module = this.getModule(item);
		if (!module) return null;

		if (this.isHidden(item)) return null;

		switch (item.getKind()) {
			case TS.SyntaxKind.ClassDeclaration:
				return `/modules/${module.slug}/classes/${this.getSlug(item)}`;
			case TS.SyntaxKind.InterfaceDeclaration:
				return `/modules/${module.slug}/interfaces/${this.getSlug(item)}`;
			case TS.SyntaxKind.EnumDeclaration:
				return `/modules/${module.slug}/enums/${this.getSlug(item)}`;
			case TS.SyntaxKind.FunctionDeclaration:
				return `/modules/${module.slug}/functions/${this.getSlug(item)}`;
			// case TS.SyntaxKind.VariableDeclaration:
			// 	return `/modules/${module.slug}/constants/${this.getSlug(item)}`;
			default:
				return null;
		}
	}

	getModule(item: TS.Node): Module | null {
		const file = item.getSourceFile();
		if (file.isFromExternalLibrary()) return null;
		if (file.isDeclarationFile()) return null;

		const filePath = file.getFilePath();
		for (const module of this.modules) {
			if (filePath.startsWith(module.rootDirectory)) {
				return module;
			}
		}

		throw new Error(`Module not found for path "${filePath}".`);
	}

	getTags(item: TS.Node): Record<string, string | true> | null {
		const tags: Record<string, string | true> = {};
		let tagCount = 0;
		if ((item as unknown as TS.JSDocableNode).getJsDocs) {
			for (const doc of (item as unknown as TS.JSDocableNode).getJsDocs()) {
				for (const tag of doc.getTags()) {
					const tagName = tag.getTagName();
					if (SUPPORTED_TAGS.has(tagName)) {
						tags[tagName] = tag.getCommentText() || true;
						tagCount++;
					}
				}
			}
		}
		return tagCount > 0 ? tags : null;
	}

	getTag(item: TS.Node, tagName: string): string | null {
		if ((item as unknown as TS.JSDocableNode).getJsDocs) {
			for (const doc of (item as unknown as TS.JSDocableNode).getJsDocs()) {
				for (const tag of doc.getTags()) {
					if (tag.getTagName() === tagName) {
						return tag.getCommentText();
					}
				}
			}
		}
		return null;
	}

	getName(item: TS.Node): string {
		if ((item as any).getName) return (item as any).getName();
		return '';
	}

	getSourceText(item: TS.Node): string {
		const file = item.getSourceFile();
		if (file.isFromExternalLibrary()) return 'external';
		if (file.isDeclarationFile()) return 'external';
		const url = file.getFilePath() as string;
		if (url.startsWith(this.rootPath)) {
			return url.replace(this.rootPath + '/', '');
		}
		return url;
	}

	getSourceURL(item: TS.Node): string {
		const file = item.getSourceFile();
		if (file.isFromExternalLibrary()) return '';
		if (file.isDeclarationFile()) return '';
		let url = file.getFilePath() as string;
		if (url.startsWith(this.rootPath)) {
			url = this.baseURL + url.replace(this.rootPath, '');
		}
		return url;
	}

	isHidden(item: TS.Node): boolean {
		if ((item as unknown as TS.JSDocableNode).getJsDocs) {
			for (const doc of (item as unknown as TS.JSDocableNode).getJsDocs()) {
				for (const tag of doc.getTags()) {
					if (tag.getTagName() === 'hidden') return true;
					if (tag.getTagName() === 'internal') return true;
				}
			}
		}
		return false;
	}

	renderMarkdown(md: string): string {
		return this.formatter(md);
	}
}

const fs = {
	basename(uri: string): string {
		const fileName = uri.split(/[\\/]/).pop()!;
		return fileName.substring(0, fileName.lastIndexOf('.'));
	},
	dirname(uri: string): string {
		return uri.match(/(.*)[\/\\]/)[1] || '';
	}
};
