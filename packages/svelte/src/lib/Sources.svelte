<script lang="ts">
	import type { GD } from '@greendoc/parse';
	export let data:
		| GD.ApiClass
		| GD.ApiInterface
		| GD.ApiProperty
		| GD.ApiMethod
		| GD.ApiEnum
		| GD.ApiFunction;
</script>

<aside class="greendoc-sources">
	{#if (data.kind === 'Method' || data.kind === 'Property') && data.overwrite}
		<p>
			Overrides
			<a href={data.overwrite.path + '#' + data.name}>
				{data.overwrite.name}.{data.name}
			</a>
		</p>
	{/if}
	{#if data.source}
		<ul>
			<li>
				Defined in
				{#if data.source.url}
					<a href={data.source.url} target="_blank" rel="noreferrer">{data.source.text}</a>
				{:else}
					<i>{data.source.text}</i>
				{/if}
			</li>
		</ul>
	{/if}
</aside>
