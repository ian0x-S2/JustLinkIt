<script lang="ts">
	import { Search, Star, Archive, Trash2, Inbox } from '@lucide/svelte';
	import { search, selectedTags, links } from '$lib/store.svelte';

	let { onAdd }: { onAdd: () => void } = $props();

	const config = $derived.by(() => {
		const isFiltering = search?.query || selectedTags?.length > 0;
		
		if (isFiltering) {
			return {
				title: 'No results found',
				description: 'Try adjusting your search or filters to find what you\'re looking for.',
				icon: Search,
				showAdd: false
			};
		}

		switch (links.activeCategory) {
			case 'favorites':
				return {
					title: 'No favorites yet',
					description: 'Mark links as favorites to quickly access them here.',
					icon: Star,
					showAdd: false
				};
			case 'archive':
				return {
					title: 'Archive is empty',
					description: 'Move links here to keep your workspace organized.',
					icon: Archive,
					showAdd: false
				};
			case 'trash':
				return {
					title: 'Trash is empty',
					description: 'Deleted links will appear here before being permanently removed.',
					icon: Trash2,
					showAdd: false
				};
			default:
				return {
					title: 'Your inbox is empty',
					description: 'Add your first link to start building your workspace.',
					icon: Inbox,
					showAdd: true
				};
		}
	});
</script>

<div class="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
	<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30">
		<config.icon class="h-8 w-8 text-muted-foreground/40" />
	</div>
	<h3 class="text-base font-semibold text-foreground">{config.title}</h3>
	<p class="mt-1.5 text-sm text-muted-foreground max-w-[280px]">
		{config.description}
	</p>
	
	{#if config.showAdd}
		<button 
			onclick={onAdd}
			class="mt-6 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
		>
			Add your first link
		</button>
	{/if}
</div>