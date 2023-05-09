<script lang="ts">
	import type { PageData } from './$types';
	import { Class } from '@greendoc/svelte';
	export let data: PageData;
</script>

<section class="greendoc-panel">
	<h1>{data.export.name}</h1>
</section>

<Class data={data.export} />
