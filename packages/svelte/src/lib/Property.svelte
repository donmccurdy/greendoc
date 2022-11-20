<script lang="ts">
	import type { SerializedApiProperty } from '@greendoc/parse';
	import Excerpt from './Excerpt.svelte';
	import Comment from './Comment.svelte';
	export let data: SerializedApiProperty;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-property"
	class:tsd-parent-kind-class={true}
	class:tsd-is-overwrite={true}
>
	<a name="propertytype" class="tsd-anchor" />
	<div class="tsd-signature tsd-kind-icon">
		<Excerpt data={data.excerpt} />
	</div>
	<Comment data={data.comment} />
	<aside class="tsd-sources">
		<p>
			Overrides TODO<!-- Overrides <a href="todo.html">TODO</a>.<a href="todo.html#todoproperty">{data.name}</a> -->
		</p>
		<ul>
			<li>
				Defined in TODO<!-- Defined in <a href="TODO.ts#L44">TODO.ts:44</a> -->
			</li>
		</ul>
	</aside>
</section>
