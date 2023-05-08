<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	import Reference from './Reference.svelte';
	export let data: GD.ApiEnumMember;
</script>

<section class="tsd-panel tsd-member tsd-kind-property">
	<!-- svelte-ignore a11y-missing-content -->
	<a name={data.name} class="tsd-anchor" />
	<div class="tsd-signature tsd-kind-icon">
		{data.name}{#if typeof data.type === 'string'}:
			<span class="tsd-signature-symbol">{data.type}</span>{:else if data.type}: <Reference
				data={data.type}
			/>{/if}
	</div>
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>
