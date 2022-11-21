<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Method from './Method.svelte';
	import Property from './Property.svelte';
	import Comment from './Comment.svelte';
	export let data: GD.ApiClass;
</script>

<section class="tsd-panel tsd-comment">
	<Comment data={data.comment} />
</section>

{#if data.staticProperties.length}
	<section class="tsd-panel-group tsd-member-group ">
		<h2>Static properties</h2>
		{#each data.staticProperties as property}
			<Property data={property} />
		{/each}
	</section>
{/if}

{#if data.staticMethods.length}
	<section class="tsd-panel-group tsd-member-group ">
		<h2>Static methods</h2>
		{#each data.staticMethods as method}
			<Method data={method} />
		{/each}
	</section>
{/if}

{#if data.properties.length}
	<section class="tsd-panel-group tsd-member-group ">
		<h2>Properties</h2>
		{#each data.properties as property}
			<Property data={property} />
		{/each}
	</section>
{/if}

{#if data.methods.length}
	<section class="tsd-panel-group tsd-member-group ">
		<h2>Methods</h2>
		{#each data.methods as method}
			<Method data={method} />
		{/each}
	</section>
{/if}

<pre>{JSON.stringify(data, null, 2)}</pre>
