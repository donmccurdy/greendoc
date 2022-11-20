<script lang="ts">
	import type { SerializedExerpt } from '$lib/api';
	import Reference from './Reference.svelte';
	export let data: SerializedExerpt;
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
