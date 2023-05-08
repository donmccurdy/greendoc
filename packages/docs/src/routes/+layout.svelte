<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
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
					<div id="greendoc-filter">
						<a href="#" class="greendoc-widget options no-caption" data-toggle="options">Options</a>
						<div class="greendoc-filter-group">
							<input type="checkbox" id="greendoc-filter-inherited" checked />
							<label class="greendoc-widget" for="greendoc-filter-inherited">Inherited</label>
						</div>
					</div>
					<a href="javascript:;" id="greendoc-menu" class="greendoc-widget menu no-caption">Menu</a>
				</div>
			</div>
		</div>
	</div>
	<!-- <script>
		(function () {
			const bodyEl = document.body;

			// Show/hide navigation sidebar (mobile).
			const menuEl = document.querySelector('#greendoc-menu');
			menuEl.addEventListener('click', function () {
				if (bodyEl.classList.contains('toggle-nav')) {
					bodyEl.classList.remove('toggle-nav');
				} else {
					bodyEl.classList.add('toggle-nav');
				}
			});

			// Show/hide inherited members.
			if (location.href.includes('classes')) {
				const inheritedInputEl = document.querySelector('#greendoc-filter-inherited');
				inheritedInputEl.addEventListener('change', function () {
					if (inheritedInputEl.checked) {
						bodyEl.classList.remove('toggle-inherited');
					} else {
						bodyEl.classList.add('toggle-inherited');
					}
				});
			} else {
				const filterEl = document.querySelector('#greendoc-filter');
				filterEl.style.display = 'none';
			}
		})();
	</script> -->
</header>
<nav class="greendoc-navigation secondary">
	{#each data.navigation.sections as section}
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
	{/each}
</nav>

<div class="container container-main">
	<div class="content-wrap">
		<slot />
	</div>
</div>
