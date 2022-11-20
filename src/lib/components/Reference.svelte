<script lang="ts">
	import type { SerializedReference } from '$lib/server/serialize';
	export let data: SerializedReference;
</script>

<span>
	{#if data.path}
		<a href={data.path} class="tsd-signature-type">{data.name}</a>
	{:else}
		<span class="tsd-signature-type">{data.name}</span>
	{/if}
</span>
