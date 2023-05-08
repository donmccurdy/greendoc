<script lang="ts">
	import type { GD } from '@greendoc/parse';
	export let data: GD.Reference;
</script>

<span>
	{#if data.path}
		<a href={data.path} class="greendoc-signature-type">{data.name}</a>
	{:else}
		<span class="greendoc-signature-type">{data.name}</span>
	{/if}
</span>
