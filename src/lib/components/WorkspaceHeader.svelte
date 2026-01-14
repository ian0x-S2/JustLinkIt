<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { 
		FileJson, 
		Plus, 
		Search, 
		List, 
		LayoutGrid, 
		ChevronRight
	} from '@lucide/svelte';
	import { search } from '$lib/store.svelte';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";

	let {
		title = 'Inbox',
		onExport,
		onAddLink,
		viewMode = $bindable('list')
	}: { 
		title?: string;
		onExport: () => void;
		onAddLink: () => void;
		viewMode?: 'list' | 'grid';
	} = $props();
</script>

<header class="bg-background shrink-0 border-b h-12">
	<div class="flex items-center justify-between gap-4 px-3 h-full">
		
		<!-- Left Section: Breadcrumbs -->
		<div class="flex items-center gap-1.5 min-w-[180px]">
			<Sidebar.Trigger class="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-md" />
			<div class="h-3 w-[1px] bg-border shrink-0 mx-0.5"></div>
			
			<nav class="flex items-center gap-1.5 text-[13px] font-medium min-w-0">
				<span class="text-muted-foreground hover:text-foreground cursor-pointer transition-colors truncate">Library</span>
				<ChevronRight class="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
				<span class="text-foreground truncate">{title}</span>
			</nav>
		</div>

		<!-- Center Section: Search Bar -->
		<div class="flex-1 max-w-md">
			<div class="relative group">
				<Search class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" />
				<Input
					bind:value={search.query}
					placeholder="Search or jump to..."
					class="h-8 w-full border border-border bg-muted/20 hover:bg-muted/40 focus-visible:bg-background pl-8.5 text-[13px] shadow-none focus-visible:ring-1 focus-visible:ring-ring transition-all rounded-md"
				/>
				<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
					<kbd class="pointer-events-none h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
						ESC
					</kbd>
				</div>
			</div>
		</div>

		<!-- Right Section: Actions -->
		<div class="flex items-center gap-1 min-w-[180px] justify-end">
			<div class="flex items-center gap-0.5 border rounded-md p-0.5 bg-muted/20">
				<Tooltip.Provider delayDuration={0}>
					<Tooltip.Root>
						<Tooltip.Trigger 
							class="h-6.5 w-6.5 flex items-center justify-center rounded-[4px] transition-all {viewMode === 'list' ? 'bg-background shadow-sm text-foreground border' : 'text-muted-foreground hover:bg-muted/50'}"
							onclick={() => (viewMode = 'list')}
						>
							<List class="h-3.5 w-3.5" />
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom" class="text-[10px] py-1 px-2">List</Tooltip.Content>
					</Tooltip.Root>

					<Tooltip.Root>
						<Tooltip.Trigger 
							class="h-6.5 w-6.5 flex items-center justify-center rounded-[4px] transition-all {viewMode === 'grid' ? 'bg-background shadow-sm text-foreground border' : 'text-muted-foreground hover:bg-muted/50'}"
							onclick={() => (viewMode = 'grid')}
						>
							<LayoutGrid class="h-3.5 w-3.5" />
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom" class="text-[10px] py-1 px-2">Grid</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>

			<div class="h-4 w-[1px] bg-border mx-1"></div>

			<Button 
				variant="ghost" 
				size="icon" 
				class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
				onclick={onExport}
			>
				<FileJson class="h-3.5 w-3.5" />
			</Button>

			<Button 
				size="sm" 
				class="h-7 gap-1.5 px-2.5 rounded-md shadow-sm ml-1 text-[12px] font-medium"
				onclick={onAddLink}
			>
				<Plus class="h-3.5 w-3.5" />
				<span>New Link</span>
			</Button>
		</div>
	</div>
</header>