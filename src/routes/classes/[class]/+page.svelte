<script lang="ts">
	import type { PageData } from './$types';
	import Class from '$lib/components/Class.svelte';
	export let data: PageData;
</script>

<Class data={data.class} />
