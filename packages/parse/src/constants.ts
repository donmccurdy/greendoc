/**
 * JSDoc and TSDoc tags included in API serialization. Currently this list
 * is chosen to represent presentation-related tags, like alpha/beta/public
 * release status, rather than type-related tags.
 */
export const SUPPORTED_TAGS = new Set<string>([
	'alpha',
	'beta',
	'experimental',
	'public',
	'deprecated',
	'category' // mine
]);
