import { ApiItem, ApiItemKind, ApiModel, ApiPackage } from "@microsoft/api-extractor-model";
import { TSDocConfiguration } from "@microsoft/tsdoc";
import {  } from "@microsoft/tsdoc";

type $IntentionalAny = any;
type $StringLike = {toString: () => string};

export class Parser {
    readonly model = new ApiModel();
    readonly packages: ApiPackage[] = [];
    readonly itemToSlug = new Map<ApiItem, string>();
    readonly slugToItem = new Map<string, ApiItem>();
    readonly canonicalReferenceToItem = new Map<string, ApiItem>();

    public init(): this {
        for (const pkg of this.packages) {
            const pkgSlug = pkg.displayName.split('/').pop();
            for (const entry of pkg.members) {
                for (const member of entry.members) {
                    const slug = `${pkgSlug}.${member.displayName.toLowerCase()}.html`;
                    this.itemToSlug.set(member, slug);
                    this.slugToItem.set(slug, member);
                    this.canonicalReferenceToItem.set(member.canonicalReference.toString(), member);
                }
            }
        }
        return this;
    }

    public addPackage(json: $IntentionalAny, name: string): this {
        const pkg = ApiPackage.deserialize(json as $IntentionalAny, {
            apiJsonFilename: name,
            toolPackage: json.metadata.toolPackage,
            toolVersion: json.metadata.toolVersion,
            versionToDeserialize: json.metadata.schemaVersion,
            tsdocConfiguration: new TSDocConfiguration()
        }) as ApiPackage;
        this.packages.push(pkg);
        this.model.addMember(pkg);
        return this;
    }

    /** @internal */
    getItemBySlug(slug: string): ApiItem {
        const item = this.slugToItem.get(slug);
        if (item) return item;
        throw new Error(`Item for "${slug}" not found`);
    }

    /** @internal */
    getItemByCanonicalReference(canonicalReference: $StringLike): ApiItem | null {
        return this.canonicalReferenceToItem.get(canonicalReference.toString()) || null;
    }

    /** @internal */
    getSlug(item: ApiItem): string {
        const slug = this.itemToSlug.get(item);
        if (slug) return slug;
        throw new Error(`Slug for "${item.displayName}" not found`);
    }

    /** @internal */
    getPath(item: ApiItem): string | null {
        switch (item.kind) {
            case ApiItemKind.Class:
                return `/classes/${this.getSlug(item)}`;
            case ApiItemKind.Interface:
                return `/interfaces/${this.getSlug(item)}`;
            // case ApiItemKind.Enum:
            // 	return `/enums/${getSlug(item)}`;
            default:
                return null;
        }
    }
}
