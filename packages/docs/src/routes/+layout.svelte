<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	console.log($page.data.metadata);

	function toggleNav() {
		document.body.classList.toggle('toggle-nav');
	}
</script>

<svelte:head>
	<title>MaterialsSpecular | glTF-Transform</title>
	<meta name="description" content={$page.data.metadata.snippet} />

	<meta property="og:site_name" content="glTF-Transform" />
	<meta property="og:title" content={$page.data.metadata.title} />
	<meta property="og:description" content={$page.data.metadata.snippet} />
	<meta property="og:url" content={$page.url.href} />
	<meta name="og:image" content={$page.url.origin + '/media/hero.jpg'} />
	<meta
		name="og:image:alt"
		content="Function symbol, f(📦) → 📦, where the argument and output are a box labeled 'glTF'."
	/>
	<meta name="og:image:width" content="2000" />
	<meta name="og:image:height" content="1000" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={$page.data.metadata.title} />
	<meta name="twitter:description" content={$page.data.metadata.snippet} />
	<meta name="twitter:url" content={$page.url.href} />
	<meta name="twitter:image" content={$page.url.origin + '/media/hero.jpg'} />
	<meta
		name="twitter:image:alt"
		content="Function symbol, f(📦) → 📦, where the argument and output are a box labeled 'glTF'."
	/>
	<meta name="twitter:label1" content="Written by" />
	<meta name="twitter:data1" content="Don McCurdy" />
	<meta name="twitter:creator" content="@donrmccurdy" />
</svelte:head>

<header>
	<div class="greendoc-page-toolbar">
		<div class="container">
			<div class="table-wrap">
				<div class="table-cell">
					<strong><a href="/">glTF-Transform</a></strong>
					<a
						class="header-badge"
						target="_blank"
						href="https://github.com/donmccurdy/glTF-Transform"
						rel="noreferrer"
					>
						<img
							alt="GitHub stars"
							src="https://img.shields.io/github/stars/donmccurdy/glTF-Transform?style=social"
						/>
					</a>
				</div>
				<div class="table-cell" id="greendoc-widgets">
					<button id="greendoc-menu" class="greendoc-widget menu no-caption" on:click={toggleNav}
						>Menu</button
					>
				</div>
			</div>
		</div>
	</div>
</header>
<nav class="greendoc-navigation secondary">
	{#each data.navigation.sections as section}
		<section>
			<h4>{section.title}</h4>
			<ul>
				{#each section.items as item}
					<li class="greendoc-kind-namespace">
						<a
							href={item.href}
							class="greendoc-kind-icon"
							target={item.external ? '_blank' : ''}
							rel={item.external ? 'noreferrer' : ''}
						>
							{item.text}
						</a>
					</li>
				{/each}
			</ul>
			{#if section.subsections.length}
				{#each section.subsections as subsection}
					<section>
						<h5>{subsection.title}</h5>
						<ul>
							{#each subsection.items as item}
								<li class="greendoc-kind-namespace">
									<a
										href={item.href}
										class="greendoc-kind-icon"
										target={item.external ? '_blank' : ''}
										rel={item.external ? 'noreferrer' : ''}
									>
										{item.text}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			{/if}
		</section>
	{/each}
</nav>

<div class="container container-main">
	<div class="content-wrap">
		<slot />
	</div>
</div>
