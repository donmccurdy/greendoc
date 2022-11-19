<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>{data.title}</h1>
<a href="../">Back</a>
<pre>{JSON.stringify(data.content, null, 2)}</pre>
