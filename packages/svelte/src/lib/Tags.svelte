<script lang="ts">
	export let data: Record<string, string | true>;

	function getTagTitle(tagComment: string | true): string | null {
		if (typeof tagComment === 'string') {
			return tagComment;
		}
		return null;
	}
</script>

<ul class="tags">
	{#each Object.keys(data) as tag (tag)}
		<li class="tag" data-gd-tag={tag} title={getTagTitle(data[tag])}>
			{tag}
		</li>
	{/each}
</ul>
