<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import EnumMember from './EnumMember.svelte';
	export let data: GD.ApiEnum;
</script>

<section class="tsd-panel tsd-comment">
	<h1>{data.name}</h1>
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>

{#if data.members.length}
	<section class="tsd-panel-group tsd-member-group ">
		<h2>Members</h2>
		{#each data.members as member}
			<EnumMember data={member} />
		{/each}
	</section>
{/if}

<pre>{JSON.stringify(data, null, 2)}</pre>
