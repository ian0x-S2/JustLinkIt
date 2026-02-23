<script lang="ts">
	import { Search, Star, Trash2, Inbox } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils.js';
	import { TUI } from '$lib/tui';
	import { Button } from '$lib/components/ui/button';

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
	class="flex w-full flex-col items-center justify-center px-6 py-20 text-center"
>
	<!-- TUI Box style -->
	<div
		class={cn(
			'flex w-[90%] flex-col items-center p-6',
			'border-2 border-dashed border-border bg-muted/20'
		)}
	>
		<div class="mb-4 flex h-12 w-12 items-center justify-center bg-muted text-muted-foreground">
			<config.icon class="h-6 w-6" />
		</div>

		<h3 class="text-lg font-bold text-foreground">{config.title}</h3>
		<p class="mt-2 max-w-87.5 text-sm leading-relaxed text-muted-foreground">
			{config.description}
		</p>

		{#if config.showAdd}
			<Button
				onclick={onAdd}
				variant="outline"
				class={cn(
					'mt-6 flex h-9 items-center gap-2 rounded-none border-2 border-primary bg-primary/5 px-4',
					'text-[12px] font-bold text-primary hover:bg-primary/10 hover:text-primary!'
				)}
			>
				<span class="rounded bg-secondary px-1 text-secondary-foreground">a</span>
				<span>Add your first link</span>
			</Button>
		{/if}

		<!-- Lazygit-style hint -->
		<div class="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
			<span class="rounded bg-muted px-1.5 py-0.5">{TUI.bullet}</span>
			<span>{config.hint}</span>
		</div>
	</div>
</div>
