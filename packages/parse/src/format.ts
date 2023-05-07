import { marked } from 'marked';
import hljs from 'highlight.js';

marked.setOptions({
	highlight: function (code, lang) {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language }).value;
	}
});

export function renderMarkdown(md: string): string {
	return marked.parse(md);
}
