<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Method from './Method.svelte';
	import Property from './Property.svelte';
	import Comment from './Comment.svelte';
	export let data: GD.ApiInterface;
</script>

<section class="greendoc-panel greendoc-comment">
	<h1>{data.name}</h1>
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>

{#if data.properties.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Properties</h2>
		{#each data.properties as property}
			<Property data={property} />
		{/each}
	</section>
{/if}

{#if data.methods.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Methods</h2>
		{#each data.methods as method}
			<Method data={method} />
		{/each}
	</section>
{/if}

<pre>{JSON.stringify(data, null, 2)}</pre>
