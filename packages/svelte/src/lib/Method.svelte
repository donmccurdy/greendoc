<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Excerpt from './Excerpt.svelte';
	import Sources from './Sources.svelte';
	export let data: GD.ApiMethod;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-method"
	class:tsd-parent-kind-class={true}
	class:tsd-is-inherited={true}
	class:tsd-is-external={true}
	class:tsd-is-protected={data.isProtected}
>
	<a name={data.name} class="tsd-anchor" />
	<ul
		class="tsd-signatures tsd-kind-method"
		class:tsd-parent-kind-class={true}
		class:tsd-is-inherited={true}
		class:tsd-is-external={true}
		class:tsd-is-protected={data.isProtected}
	>
		<li class="tsd-signature tsd-kind-icon">
			<Excerpt data={data.excerpt} />
		</li>
	</ul>
	<ul class="tsd-descriptions">
		<li class="tsd-description">
			<Comment data={data.comment} />
			<Sources {data} />
		</li>
	</ul>
</section>
