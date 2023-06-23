import { noCase } from './no-case';
import { GD } from '../types';

export type SortFn = (a: GD.ApiItemBase, b: GD.ApiItemBase) => number;

/**
 * Defines default sort order, strictly alphabetical.
 */
export function createDefaultSort(): SortFn {
	return (a, b) => (a.name > b.name ? 1 : -1);
}

const DEFAULT_PREFIX_LIST = ['get', 'set', 'add', 'remove', 'delete', 'list', 'to', 'from'];

/**
 * Defines a prefix-based sort order, using the provided prefix list. This
 * sorting method is designed to keep items like `getA` and `setA` next to one
 * another, sorting first with the prefix omitted from each item, and then
 * by prefix.
 */
export function createPrefixSort(prefixList = DEFAULT_PREFIX_LIST): SortFn {
	const prefixSet = new Set(prefixList);
	return (a, b) => {
		const tokensA = noCase(a.name);
		const tokensB = noCase(b.name);

		const prefixA = prefixSet.has(tokensA[0]) ? tokensA.shift() : '';
		const prefixB = prefixSet.has(tokensB[0]) ? tokensB.shift() : '';

		const nameA = tokensA.join('');
		const nameB = tokensB.join('');

		return (nameA !== nameB ? nameA > nameB : prefixA > prefixB) ? 1 : -1;
	};
}
