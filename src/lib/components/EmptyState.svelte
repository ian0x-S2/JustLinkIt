<script lang="ts">
	import { Search, Star, Archive, Trash2, Inbox } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { AppStore } from '$lib/stores';

	let { onAdd }: { onAdd: () => void } = $props();

	const store = getContext<AppStore>('store');

	const config = $derived.by(() => {
		const isFiltering = store.filters.searchQuery || store.filters.selectedTags.length > 0;

		if (isFiltering) {
			return {
				title: 'No results found',
				description: "Try adjusting your search or filters to find what you're looking for.",
				icon: Search,
				showAdd: false
			};
		}

		switch (store.filters.activeCategory) {
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

<div in:fade={{ duration: 300 }} class="flex flex-col items-center justify-center py-24 px-8 text-center">
	<div class="mb-5 flex h-16 w-16 items-center justify-center rounded-sm bg-primary/5">
		<config.icon class="h-8 w-8 text-primary/40" />
	</div>
	<h3 class="text-[20px] font-bold tracking-tight text-foreground">{config.title}</h3>
	<p class="mt-1.5 max-w-[300px] text-[14px] leading-relaxed text-muted-foreground">
		{config.description}
	</p>

	{#if config.showAdd}
		<button
			onclick={onAdd}
			class="mt-6 h-9 rounded-sm bg-primary px-6 text-[13px] font-bold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
		>
			Add your first link
		</button>
	{/if}
</div>
