<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import Sources from './Sources.svelte';
	import Reference from './Reference.svelte';
	export let data: GD.ApiProperty;
</script>

<section
	class="tsd-panel tsd-member tsd-kind-property"
	class:tsd-parent-kind-class={true}
	class:tsd-is-overwrite={true}
>
	<!-- svelte-ignore a11y-missing-content -->
	<a name={data.name} class="tsd-anchor" />
	<div class="tsd-signature tsd-kind-icon">
		{data.name}{#if typeof data.type === 'string'}:
			<span class="tsd-signature-symbol">{data.type}</span>{:else if data.type}: <Reference
				data={data.type}
			/>{/if}
	</div>
	<Comment data={data.comment} />
	<Sources {data} />
</section>
