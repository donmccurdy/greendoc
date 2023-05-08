<script>
	import { GD } from '@greendoc/parse';
	import Method from '$lib/Method.svelte';
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<Method
	data={{
		kind: GD.ApiItemKind.METHOD,
		comment: 'Lorem ipsum...',
		name: 'dot',
		params: [
			{ name: 'a', type: 'number' },
			{ name: 'b', type: 'number' }
		],
		returns: 'void',
		isStatic: false,
		isProtected: false,
		isOptional: false
	}}
/>
