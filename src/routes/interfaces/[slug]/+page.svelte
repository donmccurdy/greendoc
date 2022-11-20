<script lang="ts">
	import type { PageData } from './$types';
	import Interface from '$lib/components/Interface.svelte';
	export let data: PageData;
</script>

<Interface data={data.interface} />
