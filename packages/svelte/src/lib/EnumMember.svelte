<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	import Reference from './Reference.svelte';
	import Tags from './Tags.svelte';
	export let data: GD.ApiEnumMember;
</script>

<section class="greendoc-panel greendoc-member greendoc-kind-property">
	<!-- svelte-ignore a11y-missing-content -->
	<a id={data.name} class="greendoc-anchor" />
	<div class="greendoc-signature greendoc-kind-icon">
		{data.name}{#if typeof data.type === 'string'}:
			<span class="greendoc-signature-symbol">{data.type}</span>{:else if data.type}: <Reference
				data={data.type}
			/>{/if}
	</div>
	{#if data.tags}
		<Tags data={data.tags} />
	{/if}
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>
