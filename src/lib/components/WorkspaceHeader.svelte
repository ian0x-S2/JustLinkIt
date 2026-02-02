<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Plus, Search, List, LayoutGrid, ChevronRight, FileBraces } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let {
		onExport,
		onAddLink,
		viewMode = $bindable('list')
	}: {
		onExport: () => void;
		onAddLink: () => void;
		viewMode?: 'list' | 'grid';
	} = $props();

	const store = getContext<AppStore>('store');

	const title = $derived(
		store.filters.activeCategory.charAt(0).toUpperCase() + store.filters.activeCategory.slice(1)
	);
</script>

<header class="h-12 shrink-0 border-t border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="flex h-full items-center justify-between gap-4 px-3">
		<!-- Left Section: Breadcrumbs -->
		<div class="flex w-64 shrink-0 items-center gap-1.5">
			<Sidebar.Trigger
				class="h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
			/>
			<div class="mx-0.5 h-3 w-px shrink-0 bg-border"></div>

			<nav class="flex min-w-0 items-center gap-1.5 text-[13px] font-medium">
				<span
					class="cursor-pointer truncate text-muted-foreground transition-colors hover:text-foreground"
					>{store.workspaces.active?.name || 'Workspace'}</span
				>
				<ChevronRight class="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
				<span class="truncate text-foreground">{title}</span>
			</nav>
		</div>

		<!-- Center Section: Search Bar (Absolute Centering to avoid shift) -->
		<div class="pointer-events-none absolute inset-x-0 flex justify-center">
			<div class="group pointer-events-auto relative w-full max-w-md">
				<Search
					class="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40"
				/>
				<Input
					value={store.filters.searchQuery}
					oninput={(e) => store.filters.setSearchQuery(e.currentTarget.value)}
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							store.filters.setSearchQuery('');
							e.currentTarget.blur();
						}
					}}
					placeholder="Search or jump to..."
					class="h-8 w-full rounded-md border border-border bg-muted/20 pl-8.5 text-[13px] shadow-none transition-all hover:bg-muted/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
				/>
				<div
					class="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100"
				>
					<kbd
						class="pointer-events-none h-4 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none"
					>
						ESC
					</kbd>
				</div>
			</div>
		</div>

		<!-- Right Section: Actions -->
		<div class="flex w-64 shrink-0 items-center justify-end gap-1">
			<div class="flex items-center gap-0.5 rounded-md border bg-muted/20 p-0.5">
				<Tooltip.Root ignoreNonKeyboardFocus delayDuration={900}>
					<Tooltip.Trigger
						class="flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-all {viewMode ===
						'list'
							? 'border bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-muted/50'}"
						onclick={() => (viewMode = 'list')}
					>
						<List class="h-3.5 w-3.5" />
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom" class="px-2 py-1 text-[10px]">List</Tooltip.Content>
				</Tooltip.Root>

				<Tooltip.Root ignoreNonKeyboardFocus delayDuration={900}>
					<Tooltip.Trigger
						class="flex h-6.5 w-6.5 items-center justify-center rounded-lg transition-all {viewMode ===
						'grid'
							? 'border bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:bg-muted/50'}"
						onclick={() => (viewMode = 'grid')}
					>
						<LayoutGrid class="h-3.5 w-3.5" />
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom" class="px-2 py-1 text-[10px]">Grid</Tooltip.Content>
				</Tooltip.Root>
			</div>

			<div class="mx-1 h-4 w-px bg-border"></div>

			<Button
				variant="ghost"
				size="icon"
				class="h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
				onclick={onExport}
			>
				<FileBraces class="h-3.5 w-3.5" />
			</Button>

			<Button
				size="sm"
				class="ml-1 h-7 gap-1.5 rounded-md px-2.5 text-[12px] font-medium shadow-sm"
				onclick={onAddLink}
			>
				<Plus class="h-3.5 w-3.5" />
				<span>New Link</span>
			</Button>
		</div>
	</div>
</header>
