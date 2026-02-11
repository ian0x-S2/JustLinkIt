<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils.js';
	import { TUI, theme } from '$lib/tui';
	import LazyPanel from './tui/LazyPanel.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	const store = getContext<AppStore>('store');

	const trendingTags = $derived.by(() => {
		const tagCounts: Record<string, number> = {};
		store.links.links.forEach((link) => {
			if (link.isDeleted) return;
			link.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		});
		return Object.entries(tagCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8);
	});

	const stats = $derived.by(() => {
		const activeLinks = store.links.links.filter((l) => !l.isDeleted);
		const total = activeLinks.length;
		const favorites = activeLinks.filter((l) => l.isFavorite).length;
		return { total, favorites };
	});
</script>

<aside class="ml-2 hidden w-75 shrink-0 flex-col gap-4 border-border lg:flex">
	<!-- Search Panel -->
	<LazyPanel title="Search" titleClass={theme.titleStatus} class="min-h-20 flex-[0.3]">
		<div class="relative mt-1">
			<span class="absolute top-1/2 left-2 -translate-y-1/2 text-[13px] text-primary">/</span>
			<input
				value={store.filters.searchQuery}
				oninput={(e) => store.filters.setSearchQuery(e.currentTarget.value)}
				placeholder="type to filter..."
				class="w-full border-none bg-background pl-6 font-mono text-[13px] text-foreground outline-none"
			/>
		</div>
	</LazyPanel>

	<!-- Stats Panel -->
	<LazyPanel title="Statistics" titleClass={theme.titleCommits} class="flex-[0.5]">
		<div class="flex flex-col gap-1 font-mono text-[12px]">
			<div class="flex items-center justify-between border-b border-border/30 py-1">
				<span class="text-muted-foreground">Total Links</span>
				<span class="font-bold text-primary">{stats.total}</span>
			</div>
			<div class="flex items-center justify-between py-1">
				<span class="text-muted-foreground">Favorites</span>
				<span class="font-bold text-chart-3">{stats.favorites}</span>
			</div>
		</div>
	</LazyPanel>

	<!-- Tags Panel -->
	<LazyPanel title="Top Tags" titleClass={theme.titleBranches} class="flex-1">
		<ScrollArea type="hover" class="h-full w-full">
			<div class="flex flex-col gap-0.5">
				{#each trendingTags as [tag, count] (tag)}
					<button
						onclick={() => store.filters.toggleTag(tag)}
						class={cn(theme.item, theme.itemDefault, 'px-2 py-0.5')}
					>
						<span class="text-[10px] text-primary">{TUI.bullet}</span>
						<span class="flex-1 truncate text-left">{tag}</span>
						<span class="text-[10px] text-muted-foreground">({count})</span>
					</button>
				{:else}
					<div class="text-muted-foreground italic text-center py-4">No tags found</div>
				{/each}
			</div>
		</ScrollArea>
	</LazyPanel>

	<!-- App Info Panel -->
	<LazyPanel title="LinkFeed" titleClass={theme.titleStash} class="flex-[0.4]">
		<div class="flex flex-col gap-2 p-1">
			<div class="text-[11px] leading-relaxed text-muted-foreground">
				Local-first link manager inspired by Lazygit.
			</div>
			<div class="mt-2 flex items-center gap-2">
				<span class="bg-accent px-1 text-[10px] text-accent-foreground">PROMPT</span>
				<span class="text-[11px] text-chart-5">v0.1.0-alpha</span>
			</div>
		</div>
	</LazyPanel>
</aside>

