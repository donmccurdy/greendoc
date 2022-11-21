<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Method from './Method.svelte';
	import Property from './Property.svelte';
	import Comment from './Comment.svelte';
	export let data: GD.ApiInterface;
</script>

<section class="tsd-panel tsd-comment">
	<Comment data={data.comment} />
</section>

<section class="tsd-panel-group tsd-member-group ">
	<h2>Properties</h2>
	{#each data.properties as property}
		<Property data={property} />
	{/each}
</section>

<section class="tsd-panel-group tsd-member-group ">
	<h2>Methods</h2>
	{#each data.methods as method}
		<Method data={method} />
	{/each}
</section>

<pre>{JSON.stringify(data, null, 2)}</pre>
