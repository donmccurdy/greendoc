<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	import Reference from './Reference.svelte';
	export let data: GD.ApiFunction;
</script>

<section class="greendoc-panel greendoc-comment">
	<h1>{data.name}</h1>
</section>

<section class="greendoc-panel greendoc-member greendoc-kind-function">
	<!-- svelte-ignore a11y-missing-content -->
	<a id={data.name} class="greendoc-anchor" />
	<ul class="greendoc-signatures greendoc-kind-function">
		<li class="greendoc-signature greendoc-kind-icon">
			{data.name}({#each data.params as param, i}{param.name}{#if param.optional}?{/if}{#if typeof param.type === 'string'}:
					<span class="greendoc-signature-symbol">{param.type}</span>{:else if param.type}: <Reference
						data={param.type}
					/>{/if}{#if i < data.params.length - 1},
				{/if}{/each}):
			{#if typeof data.returns === 'string'}<span class="greendoc-signature-symbol"
					>{data.returns}</span
				>{:else}<Reference data={data.returns} />{/if}
		</li>
	</ul>
	<ul class="greendoc-descriptions">
		<li class="greendoc-description">
			{#if data.comment}
				<Comment data={data.comment} />
			{/if}
			<Sources {data} />
		</li>
	</ul>
</section>
