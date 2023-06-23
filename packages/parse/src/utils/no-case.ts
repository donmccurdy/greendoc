/**
 * no-case
 *
 * Based on https://github.com/blakeembrey/change-case/blob/master/packages/no-case/src/index.ts,
 * released under MIT License.
 */

// Support camel case ("camelCase" -> "camel Case" and "CAMELCase" -> "CAMEL Case").
const DEFAULT_SPLIT_REGEXP = [/([a-z0-9])([A-Z])/g, /([A-Z])([A-Z][a-z])/g];

// Remove all non-word characters.
const DEFAULT_STRIP_REGEXP = /[^A-Z0-9]+/gi;

/** Normalize the string into an array of 'words'. */
export function noCase(input: string): string[] {
	const splitRegexp = DEFAULT_SPLIT_REGEXP;
	const stripRegexp = DEFAULT_STRIP_REGEXP;
	const transform = (s: string) => s.toLowerCase();
	const delimiter = ' ';

	let result = replace(replace(input, splitRegexp, '$1\0$2'), stripRegexp, '\0');
	let start = 0;
	let end = result.length;

	// Trim the delimiter from around the output string.
	while (result.charAt(start) === '\0') start++;
	while (result.charAt(end - 1) === '\0') end--;

	// Transform each token independently.
	return result.slice(start, end).split('\0').map(transform);
}

/** Replace `re` in the input string with the replacement value. */
function replace(input: string, re: RegExp | RegExp[], value: string) {
	if (re instanceof RegExp) return input.replace(re, value);
	return re.reduce((input, re) => input.replace(re, value), input);
}
