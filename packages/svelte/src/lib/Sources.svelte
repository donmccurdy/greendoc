<script lang="ts">
	import type { GD } from '@greendoc/parse';
	export let data: GD.ApiClass | GD.ApiInterface | GD.ApiProperty | GD.ApiMethod | GD.ApiEnum;
</script>

<aside class="tsd-sources">
	{#if (data.kind === 'Method' || data.kind === 'Property') && data.overwrite}
		<p>
			Overrides
			<a href={data.overwrite.path + '#' + data.name}>
				{data.overwrite.name}.{data.name}
			</a>
		</p>
	{/if}
	{#if data.sourceUrl}
		<ul>
			<li>
				Defined in <a href={data.sourceUrl} target="_blank" rel="noreferrer"
					>{data.sourceUrlPath || data.sourceUrl}</a
				>
			</li>
		</ul>
	{/if}
</aside>
