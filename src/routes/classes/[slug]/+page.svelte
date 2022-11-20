<script lang="ts">
	import type { PageData } from './$types';
	import { Class } from '$lib/components';
	export let data: PageData;
</script>

<Class data={data.class} />
