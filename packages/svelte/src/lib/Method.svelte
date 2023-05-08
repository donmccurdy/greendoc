<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	import Reference from './Reference.svelte';
	export let data: GD.ApiMethod;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-method"
	class:tsd-parent-kind-class={true}
	class:tsd-is-inherited={true}
	class:tsd-is-external={true}
	class:tsd-is-protected={data.isProtected}
>
	<!-- svelte-ignore a11y-missing-content -->
	<a name={data.name} class="tsd-anchor" />
	<ul
		class="tsd-signatures tsd-kind-method"
		class:tsd-parent-kind-class={true}
		class:tsd-is-inherited={true}
		class:tsd-is-external={true}
		class:tsd-is-protected={data.isProtected}
	>
		<li class="tsd-signature tsd-kind-icon">
			{data.name}({#each data.params as param, i}{param.name}{#if param.optional}?{/if}{#if typeof param.type === 'string'}:
					<span class="tsd-signature-symbol">{param.type}</span>{:else if param.type}: <Reference
						data={param.type}
					/>{/if}{#if i < data.params.length - 1},
				{/if}{/each}):
			{#if typeof data.returns === 'string'}<span class="tsd-signature-symbol">{data.returns}</span
				>{:else}<Reference data={data.returns} />{/if}
		</li>
	</ul>
	<ul class="tsd-descriptions">
		<li class="tsd-description">
			{#if data.comment}
				<Comment data={data.comment} />
			{/if}
			<Sources {data} />
		</li>
	</ul>
</section>
