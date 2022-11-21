<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Reference from './Reference.svelte';
	export let data: GD.Excerpt;
</script>

<span>
	{#each data.tokens as token}
		{#if typeof token === 'string'}
			<span class="tsd-signature-symbol">{token}</span>
		{:else}
			<Reference data={token} />
		{/if}
	{/each}
</span>
