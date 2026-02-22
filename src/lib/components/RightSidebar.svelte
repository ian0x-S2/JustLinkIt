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
	import { browser } from '$app/environment';
	import { StatsService } from '$lib/stores/infra/services/stats';

	const store = getContext<AppStore>('store');

	const trendingTags = $derived.by(() => {
		return StatsService.getTrendingTags(store.links.links, 100);
	});

	const stats = $derived.by(() => {
		return StatsService.getStats(store.links.links);
	});

	const chartConfig = {
		count: {
			label: 'Links',
			color: 'var(--primary)'
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

<div class="flex h-full w-full flex-col gap-3">
	<!-- Stats Panel -->
	<LazyPanel title="Statistics" titleClass={theme.titleCommits} class="min-h-50 flex-1">
		<div class="flex h-full flex-col font-mono text-[12px]">
			<!-- Activity Chart -->
			<div class="flex h-full flex-col gap-2">
				<span class="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase"
					>7-Day Activity</span
				>
				<div class="min-h-0 w-full flex-1">
					{#if browser && stats.activity.length > 0}
						<ChartUI.ChartContainer config={chartConfig} class="aspect-auto h-full w-full">
							<BarChart
								data={stats.activity}
								x="date"
								xScale={scaleBand().padding(0.4)}
								y="count"
								yDomain={[0, Math.max(5, ...stats.activity.map((d) => d.count))]}
								axis="x"
								grid={true}
								props={{
									xAxis: {
										tickLabelProps: { class: 'fill-muted-foreground text-[8px]' },
										rule: false
									},
									bars: {
										rounded: 'top',
										class: 'fill-primary/60 hover:fill-primary transition-colors'
									}
								}}
							>
								{#snippet tooltip()}
									<ChartUI.ChartTooltip hideLabel class="border-primary/20" />
								{/snippet}
							</BarChart>
						</ChartUI.ChartContainer>
					{:else}
						<div class="h-full w-full animate-pulse bg-muted/20"></div>
					{/if}
				</div>
			</div>
		</div>
	</LazyPanel>

	<!-- Tags Panel -->
	<LazyPanel title="Top Tags" titleClass={theme.titleBranches} class="min-h-45 flex-1">
		<ScrollArea type="hover" class="h-full w-full">
			<div class="flex flex-col gap-0.5">
				{#each trendingTags as [tag, count] (tag)}
					{@const isSelected = store.filters.selectedTags.includes(tag)}
					<button
						onclick={() => store.filters.toggleTag(tag)}
						class={cn(
							theme.item,
							theme.itemDefault,
							'group relative px-2 py-0.5',
							isSelected && 'bg-primary/20 font-bold text-primary'
						)}
					>
						<span class={cn('text-[10px]', isSelected ? 'text-primary' : 'text-muted-foreground')}>
							{isSelected ? TUI.arrowRight : TUI.bullet}
						</span>
						<span class="ml-1 flex-1 truncate text-left">{tag}</span>
						<span
							class={cn('text-[10px]', isSelected ? 'text-primary/70' : 'text-muted-foreground')}
						>
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
	<LazyPanel title="LinkIt" titleClass={theme.titleStash} class="min-h-30 flex-1">
		<div class="flex h-full flex-col">
			<div
				class="relative hidden min-h-35 flex-1 items-center justify-center overflow-hidden lg:flex"
			>
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
</div>
