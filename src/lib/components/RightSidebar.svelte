<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { Input } from '$lib/components/ui/input';
	import { Search } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';

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
			.slice(0, 5);
	});

	const recentLinks = $derived.by(() => {
		return [...store.links.links]
			.filter((l) => !l.isDeleted)
			.sort((a, b) => b.createdAt - a.createdAt)
			.slice(0, 3);
	});

	const stats = $derived.by(() => {
		const activeLinks = store.links.links.filter((l) => !l.isDeleted);
		const total = activeLinks.length;
		const favorites = activeLinks.filter((l) => l.isFavorite).length;
		const archived = activeLinks.filter((l) => l.isArchived).length;
		return { total, favorites, archived };
	});
</script>

<aside
	class="sticky top-0 hidden h-screen w-[320px] shrink-0 flex-col gap-3 py-3 lg:flex pl-6 pr-4"
>
	<!-- Search -->
	<div class="sticky top-0 z-10 -mt-1 pt-1 pb-1.5 bg-background/80 backdrop-blur-md">
		<div class="relative group">
			<Search class="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
			<Input
				value={store.filters.searchQuery}
				oninput={(e) => store.filters.setSearchQuery(e.currentTarget.value)}
				placeholder="Search Feed"
				class="h-9 w-full rounded-sm border-transparent bg-muted/60 pl-10 text-[13px] shadow-none transition-all hover:bg-muted/80 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
			/>
		</div>
	</div>

	<!-- Stats Card -->
	<div class="rounded-sm bg-muted/20 border border-border/10">
		<h2 class="px-3.5 py-2.5 text-[14px] font-bold tracking-tight">Workspace Stats</h2>
		<div class="grid grid-cols-3 gap-0.5 px-1.5 pb-2.5">
			<div class="flex flex-col items-center p-1.5 rounded-sm hover:bg-muted/40 transition-colors">
				<p class="text-[14px] font-bold">{stats.total}</p>
				<p class="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Links</p>
			</div>
			<div class="flex flex-col items-center p-1.5 rounded-sm hover:bg-muted/40 transition-colors">
				<p class="text-[14px] font-bold">{stats.favorites}</p>
				<p class="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Likes</p>
			</div>
			<div class="flex flex-col items-center p-1.5 rounded-sm hover:bg-muted/40 transition-colors">
				<p class="text-[14px] font-bold">{stats.archived}</p>
				<p class="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Saved</p>
			</div>
		</div>
	</div>

	<!-- Trending Tags -->
	{#if trendingTags.length > 0}
		<div class="rounded-sm bg-muted/20 border border-border/10 overflow-hidden">
			<h2 class="px-3.5 py-2.5 text-[14px] font-bold tracking-tight">Trends for you</h2>
			<div class="flex flex-col">
				{#each trendingTags as [tag, count] (tag)}
					<button
						onclick={() => store.filters.toggleTag(tag)}
						class="flex flex-col gap-0 px-3.5 py-2 text-left transition-colors hover:bg-muted/40"
					>
						<p class="text-[11px] text-muted-foreground">Trending</p>
						<p class="text-[13px] font-bold">#{tag}</p>
						<p class="text-[11px] text-muted-foreground">{count} links</p>
					</button>
				{/each}
				<button class="px-3.5 py-2.5 text-[12px] font-bold text-primary hover:bg-muted/40 text-left transition-colors">
					Show more
				</button>
			</div>
		</div>
	{/if}

	<!-- Recent Links -->
	{#if recentLinks.length > 0}
		<div class="rounded-sm bg-muted/20 border border-border/10 overflow-hidden">
			<h2 class="px-3.5 py-2.5 text-[14px] font-bold tracking-tight">Recent activity</h2>
			<div class="flex flex-col">
				{#each recentLinks as link (link.id)}
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="group flex flex-col gap-0 px-3.5 py-2 transition-colors hover:bg-muted/40"
					>
						<p class="line-clamp-1 text-[13px] font-bold group-hover:text-primary transition-colors">
							{link.title || link.url}
						</p>
						<p class="text-[11px] text-muted-foreground">
							{formatDistanceToNow(link.createdAt, { addSuffix: true })}
						</p>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Footer -->
	<div class="px-3.5 py-2 flex flex-wrap gap-x-3 gap-y-0.5 opacity-60">
		<button class="text-[10px] text-muted-foreground hover:underline">Terms</button>
		<button class="text-[10px] text-muted-foreground hover:underline">Privacy</button>
		<button class="text-[10px] text-muted-foreground hover:underline">Cookies</button>
		<button class="text-[10px] text-muted-foreground hover:underline">Ads</button>
		<p class="text-[10px] text-muted-foreground">© 2026 LinkFeed</p>
	</div>
</aside>
