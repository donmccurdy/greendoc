<script lang="ts">
	import type { SerializedReference } from '$lib/server/serialize';
	export let data: SerializedReference;
</script>

<span>
	<a href={data.slug} class="tsd-signature-type">{data.name}</a>
</span>
