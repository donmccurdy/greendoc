<script lang="ts">
	import type { SerializedApiMethod } from '$lib/server/serialize';
	import Comment from './Comment.svelte';
	import Excerpt from './Excerpt.svelte';
	export let data: SerializedApiMethod;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-method tsd-parent-kind-class tsd-is-inherited tsd-is-external"
	class:tsd-is-protected={data.isProtected}
>
	<a name={data.name} class="tsd-anchor" />
	<ul
		class="tsd-signatures tsd-kind-method tsd-parent-kind-class tsd-is-inherited tsd-is-external"
		class:tsd-is-protected={data.isProtected}
	>
		<li class="tsd-signature tsd-kind-icon">
			<Excerpt data={data.excerpt} />
		</li>
	</ul>
	<ul class="tsd-descriptions">
		<li class="tsd-description">
			<Comment data={data.comment} />
			<aside class="tsd-sources">
				<ul>
					<li>Defined in TODO.ts:125</li>
				</ul>
			</aside>
		</li>
	</ul>
</section>
<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
