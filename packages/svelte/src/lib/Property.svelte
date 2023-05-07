<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Excerpt from './Excerpt.svelte';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	export let data: GD.ApiProperty;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-property"
	class:tsd-parent-kind-class={true}
	class:tsd-is-overwrite={true}
>
	<a name={data.name} class="tsd-anchor" />
	<div class="tsd-signature tsd-kind-icon">
		{data.name}: [type]
	</div>
	<Comment data={data.comment} />
	<Sources {data} />
</section>
