import { DocExcerpt, type DocNode } from '@microsoft/tsdoc';
import { marked } from 'marked';
import hljs from 'highlight.js';

/**
 * https://github.com/microsoft/tsdoc/blob/main/api-demo/src/Formatter.ts
 */
export function renderDocNode(docNode: DocNode): string {
	let result: string = '';
	if (docNode) {
		if (docNode instanceof DocExcerpt) {
			result += docNode.content.toString();
		}
		for (const childNode of docNode.getChildNodes()) {
			result += renderDocNode(childNode);
		}
	}
	return result;
}

export function renderDocNodes(docNodes: ReadonlyArray<DocNode>): string {
	let result: string = '';
	for (const docNode of docNodes) {
		result += renderDocNode(docNode);
	}
	return result;
}

marked.setOptions({
	highlight: function (code, lang) {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language }).value;
	}
});

export function renderMarkdown(md: string): string {
	return marked.parse(md);
}
