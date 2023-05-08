<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Method from './Method.svelte';
	import Property from './Property.svelte';
	import Comment from './Comment.svelte';
	import Reference from './Reference.svelte';
	export let data: GD.ApiClass;
</script>

<section class="greendoc-panel greendoc-comment">
	<h1>{data.name}</h1>
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>

{#if data.extendsTypes.length}
	<section class="greendoc-panel greendoc-hierarchy">
		<h3>Hierarchy</h3>
		<ul class="greendoc-hierarchy">
			{#each data.extendsTypes as extendsType}
				<li>
					<Reference data={extendsType} />
				</li>
			{/each}
			<li>
				<Reference data={{ name: data.name, kind: data.kind }} />
			</li>
		</ul>
	</section>
{/if}

{#if data.staticProperties.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Static properties</h2>
		{#each data.staticProperties as property}
			{#if !property.isProtected}
				<Property data={property} />
			{/if}
		{/each}
	</section>
{/if}

{#if data.staticMethods.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Static methods</h2>
		{#each data.staticMethods as method}
			{#if !method.isProtected}
				<Method data={method} />
			{/if}
		{/each}
	</section>
{/if}

{#if data.properties.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Properties</h2>
		{#each data.properties as property}
			{#if !property.isProtected}
				<Property data={property} />
			{/if}
		{/each}
	</section>
{/if}

{#if data.methods.length}
	<section class="greendoc-panel-group greendoc-member-group ">
		<h2>Methods</h2>
		{#each data.methods as method}
			{#if !method.isProtected}
				<Method data={method} />
			{/if}
		{/each}
	</section>
{/if}

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
