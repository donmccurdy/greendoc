<script lang="ts">
	import type { PageData } from './$types';
	import { Interface } from '$lib/components';
	export let data: PageData;
</script>

<Interface data={data.interface} />
