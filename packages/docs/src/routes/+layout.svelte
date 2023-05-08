<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	function toggleNav() {
		document.body.classList.toggle('toggle-nav');
	}
</script>

<header>
	<div class="greendoc-page-toolbar">
		<div class="container">
			<div class="table-wrap">
				<div class="table-cell">
					<strong><a href="../">glTF-Transform</a></strong>
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
