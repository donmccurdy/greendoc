<script lang="ts">
	import type { GD } from '@greendoc/parse';
	import Comment from './Comment.svelte';
	import EnumMember from './EnumMember.svelte';
	import Tags from './Tags.svelte';
	export let data: GD.ApiEnum;
</script>

<section class="greendoc-panel greendoc-comment">
	{#if data.tags}
		<Tags data={data.tags} />
	{/if}
	{#if data.comment}
		<Comment data={data.comment} />
	{/if}
</section>

{#if data.members.length}
	<section class="greendoc-panel-group greendoc-member-group">
		<h2>Members</h2>
		{#each data.members as member}
			<EnumMember data={member} />
		{/each}
	</section>
{/if}

<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
