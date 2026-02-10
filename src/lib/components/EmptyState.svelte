<script lang="ts">
	import { Search, Star, Archive, Trash2, Inbox } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils.js';
	import { TUI } from '$lib/tui';

	let { onAdd }: { onAdd: () => void } = $props();

	const store = getContext<AppStore>('store');

	const config = $derived.by(() => {
		const isFiltering = store.filters.searchQuery || store.filters.selectedTags.length > 0;

		if (isFiltering) {
			return {
				title: 'No results found',
				description: "Try adjusting your search or filters to find what you're looking for.",
				icon: Search,
				showAdd: false,
				hint: 'Press / to search'
			};
		}

		switch (store.filters.activeCategory) {
			case 'favorites':
				return {
					title: 'No favorites yet',
					description: 'Mark links as favorites to quickly access them here.',
					icon: Star,
					showAdd: false,
					hint: 'Press f on any link to favorite'
				};
			case 'archive':
				return {
					title: 'Archive is empty',
					description: 'Move links here to keep your workspace organized.',
					icon: Archive,
					showAdd: false,
					hint: 'Press a on any link to archive'
				};
			case 'trash':
				return {
					title: 'Trash is empty',
					description: 'Deleted links will appear here before being permanently removed.',
					icon: Trash2,
					showAdd: false,
					hint: 'Press d on any link to trash'
				};
			default:
				return {
					title: 'Your inbox is empty',
					description: 'Add your first link to start building your workspace.',
					icon: Inbox,
					showAdd: true,
					hint: 'Press a to add a new link'
				};
		}
	});
</script>

<div
	in:fade={{ duration: 200 }}
	class="flex flex-col items-center justify-center px-6 py-20 text-center"
>
	<!-- TUI Box style -->
	<div
		class={cn('flex flex-col items-center p-6', 'border-2 border-dashed border-border bg-muted/20')}
	>
		<div class="mb-4 flex h-12 w-12 items-center justify-center bg-muted text-muted-foreground">
			<config.icon class="h-6 w-6" />
		</div>

		<h3 class="text-[15px] font-bold text-foreground">{config.title}</h3>
		<p class="mt-1 max-w-[280px] text-[12px] leading-relaxed text-muted-foreground">
			{config.description}
		</p>

		{#if config.showAdd}
			<button
				onclick={onAdd}
				class={cn(
					'mt-4 flex items-center gap-2 border-2 border-primary bg-primary/5 px-4 py-1.5',
					'text-[12px] font-bold text-primary hover:bg-primary/10'
				)}
			>
				<span class="rounded bg-secondary px-1 text-secondary-foreground">a</span>
				<span>Add your first link</span>
			</button>
		{/if}

		<!-- Lazygit-style hint -->
		<div class="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
			<span class="rounded bg-muted px-1.5 py-0.5">{TUI.bullet}</span>
			<span>{config.hint}</span>
		</div>
	</div>
</div>
