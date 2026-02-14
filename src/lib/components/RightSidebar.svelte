<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils';
	import { TUI, theme } from '$lib/tui';
	import LazyPanel from './tui/LazyPanel.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { BarChart } from 'layerchart';
	import { scaleBand } from 'd3-scale';
	import * as ChartUI from '$lib/components/ui/chart';
	import { subDays, format, startOfDay, isSameDay } from 'date-fns';
	import { browser } from '$app/environment';

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
		
		// Activity data for chart (last 7 days)
		const last7Days = Array.from({ length: 7 }, (_, i) => {
			const date = subDays(startOfDay(new Date()), 6 - i);
			const count = activeLinks.filter(l => isSameDay(new Date(l.createdAt), date)).length;
			return {
				date: format(date, 'EEE'),
				fullDate: format(date, 'MMM d'),
				count
			};
		});

		return { total, favorites, activity: last7Days };
	});

	const chartConfig = {
		count: {
			label: "Links",
			color: "var(--primary)"
		}
	} as ChartUI.ChartConfig;

	const asciiLogo = `
 _      _       _    _____ _   
| |    (_)     | |  |_   _| |  
| |     _ _ __ | | __ | | | |_ 
| |    | | '_ \\| |/ / | | | __|
| |____| | | | |   < _| |_| |_ 
|______|_|_| |_|_|\\_\\_____|\\__|
`;
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
	<LazyPanel title="Statistics" titleClass={theme.titleCommits} class="flex-[1.1]">
		<div class="flex h-full flex-col font-mono text-[12px]">
			<!-- Activity Chart -->
			<div class="flex h-full flex-col gap-2">
				<span class="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">7-Day Activity</span>
				<div class="min-h-0 flex-1 w-full">
					{#if browser && stats.activity.length > 0}
						<ChartUI.ChartContainer config={chartConfig} class="h-full w-full aspect-auto">
							<BarChart
								data={stats.activity}
								x="date"
								xScale={scaleBand().padding(0.4)}
								y="count"
								yDomain={[0, Math.max(5, ...stats.activity.map(d => d.count))]}
								axis="x"
								grid={true}
								props={{
									xAxis: {
										tickLabelProps: { class: "fill-muted-foreground text-[8px]" },
										rule: false
									},
									bars: {
										rounded: "top",
										class: "fill-primary/60 hover:fill-primary transition-colors"
									}
								}}
							>
								{#snippet tooltip()}
									<ChartUI.ChartTooltip hideLabel class="border-primary/20" />
								{/snippet}
							</BarChart>
						</ChartUI.ChartContainer>
					{:else}
						<div class="h-full w-full bg-muted/20 animate-pulse"></div>
					{/if}
				</div>
			</div>
		</div>
	</LazyPanel>

	<!-- Tags Panel -->
	<LazyPanel title="Top Tags" titleClass={theme.titleBranches} class="flex-1">
		<ScrollArea type="hover" class="h-full w-full">
			<div class="flex flex-col gap-0.5">
				{#each trendingTags as [tag, count] (tag)}
					{@const isSelected = store.filters.selectedTags.includes(tag)}
					<button
						onclick={() => store.filters.toggleTag(tag)}
						class={cn(
							theme.item,
							theme.itemDefault,
							'px-2 py-0.5 relative group',
							isSelected && 'bg-primary/20 text-primary font-bold'
						)}
					>
						<span class={cn("text-[10px]", isSelected ? "text-primary" : "text-muted-foreground")}>
							{isSelected ? TUI.arrowRight : TUI.bullet}
						</span>
						<span class="flex-1 truncate text-left ml-1">{tag}</span>
						<span class={cn("text-[10px]", isSelected ? "text-primary/70" : "text-muted-foreground")}>
							({count})
						</span>
					</button>
				{:else}
					<div class="text-muted-foreground italic text-center py-4">No tags found</div>
				{/each}
			</div>
		</ScrollArea>
	</LazyPanel>

	<!-- App Info Panel -->
	<LazyPanel title="LinkIt" titleClass={theme.titleStash} class="flex-[1.2]">
		<div class="flex h-full flex-col">
			<div class="relative flex min-h-35 flex-1 items-center justify-center overflow-hidden">
				<pre class="font-mono text-[10px] leading-[1.1] text-primary/80">
					{asciiLogo}
				</pre>
			</div>
			<div
				class="flex flex-col gap-2 border-t border-border/20 bg-background/50 p-1 backdrop-blur-sm"
			>
				<div class="text-[11px] leading-relaxed text-muted-foreground">
					Local-first link manager inspired by Lazygit.
				</div>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="bg-accent px-1 text-[10px] text-accent-foreground">PROMPT</span>
						<span class="text-[11px] text-chart-5">v0.1.0-alpha</span>
					</div>
					<div class="font-mono text-[10px] text-primary/50 italic">
						{TUI.check} Connected
					</div>
				</div>
			</div>
		</div>
	</LazyPanel>
</aside>
