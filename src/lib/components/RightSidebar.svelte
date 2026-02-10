<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils.js';
	import { TUI, theme } from '$lib/tui';
	import LazyPanel from './tui/LazyPanel.svelte';

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
		const archived = activeLinks.filter((l) => l.isArchived).length;
		return { total, favorites, archived };
	});
</script>

<aside class="w-[300px] shrink-0 hidden lg:flex flex-col gap-4 border-l border-border ml-2">
	<!-- Search Panel -->
	<LazyPanel title="Search" titleClass={theme.titleStatus} class="flex-[0.3] min-h-[80px]">
		<div class="relative mt-1">
			<span class="absolute left-2 top-1/2 -translate-y-1/2 text-primary text-[13px]">/</span>
			<input
				value={store.filters.searchQuery}
				oninput={(e) => store.filters.setSearchQuery(e.currentTarget.value)}
				placeholder="type to filter..."
				class="w-full bg-background border-none outline-none text-foreground text-[13px] pl-6 font-mono"
			/>
		</div>
	</LazyPanel>

	<!-- Stats Panel -->
	<LazyPanel title="Statistics" titleClass={theme.titleCommits} class="flex-[0.5]">
		<div class="flex flex-col gap-1 font-mono text-[12px]">
			<div class="flex justify-between items-center py-1 border-b border-border/30">
				<span class="text-muted-foreground">Total Links</span>
				<span class="text-primary font-bold">{stats.total}</span>
			</div>
			<div class="flex justify-between items-center py-1 border-b border-border/30">
				<span class="text-muted-foreground">Favorites</span>
				<span class="text-chart-3 font-bold">{stats.favorites}</span>
			</div>
			<div class="flex justify-between items-center py-1">
				<span class="text-muted-foreground">Archived</span>
				<span class="text-muted-foreground font-bold">{stats.archived}</span>
			</div>
		</div>
	</LazyPanel>

	<!-- Tags Panel -->
	<LazyPanel title="Top Tags" titleClass={theme.titleBranches} class="flex-1">
		<div class="flex flex-col gap-0.5">
			{#each trendingTags as [tag, count] (tag)}
				<button
					onclick={() => store.filters.toggleTag(tag)}
					class={cn(theme.item, theme.itemDefault, 'px-2 py-0.5')}
				>
					<span class="text-primary text-[10px]">{TUI.bullet}</span>
					<span class="flex-1 text-left truncate">{tag}</span>
					<span class="text-muted-foreground text-[10px]">({count})</span>
				</button>
			{:else}
				<div class="text-muted-foreground italic text-center py-4">No tags found</div>
			{/each}
		</div>
	</LazyPanel>

	<!-- App Info Panel -->
	<LazyPanel title="LinkFeed" titleClass={theme.titleStash} class="flex-[0.4]">
		<div class="flex flex-col gap-2 p-1">
			<div class="text-[11px] text-muted-foreground leading-relaxed">
				Local-first link manager inspired by Lazygit.
			</div>
			<div class="flex items-center gap-2 mt-2">
				<span class="bg-accent px-1 text-accent-foreground text-[10px]">PROMPT</span>
				<span class="text-chart-5 text-[11px]">v0.1.0-alpha</span>
			</div>
		</div>
	</LazyPanel>
</aside>