<script lang="ts">
	const DISPLAYED_TAGS = new Set<string>(['alpha', 'beta', 'experimental', 'deprecated']);

	export let data: Record<string, string | true>;

	function hasVisibleTag(): boolean {
		for (const tag in data) {
			if (DISPLAYED_TAGS.has(tag)) {
				return true;
			}
		}
		return false;
	}

	function getTagTitle(tagComment: string | true): string | null {
		if (typeof tagComment === 'string') {
			return tagComment;
		}
		return null;
	}
</script>

{#if hasVisibleTag()}
	<ul class="tags">
		{#each Object.keys(data) as tag (tag)}
			{#if DISPLAYED_TAGS.has(tag)}
				<li class="tag" data-gd-tag={tag} title={getTagTitle(data[tag])}>
					{tag}
				</li>
			{/if}
		{/each}
	</ul>
{/if}
