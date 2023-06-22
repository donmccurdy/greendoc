import { GD } from './types';

export type SortFn = (a: GD.ApiItemBase, b: GD.ApiItemBase) => number;

export function createDefaultSort(): SortFn {
	return (a, b) => (a.name > b.name ? 1 : -1);
}

export function createPrefixSort(prefixes): SortFn {
	// TODO: Need to split names into 'words'.
	throw new Error('Not implemented');
}
