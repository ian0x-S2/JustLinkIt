<script lang="ts">
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import CenterHeader from '$lib/components/CenterHeader.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import ImportDialog from '$lib/components/ImportDialog.svelte';
	import LazyStatusBar from '$lib/components/tui/LazyStatusBar.svelte';
	import LazyPanel from '$lib/components/tui/LazyPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { AppStore } from '$lib/stores';
	import type { Link, LinkId } from '$lib/types';
	import { theme } from '$lib/tui';
	import { cn } from '$lib/utils';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import TuiMobileNav from '$lib/components/TuiMobileNav.svelte';

	const store = getContext<AppStore>('store');
	const isMobile = new IsMobile();

	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let isImportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);
	let activeMobileTab = $state<'spaces' | 'links' | 'stats'>('links');

	$effect(() => {
		const tab = page.url.searchParams.get('tab');
		if (tab && (tab === 'spaces' || tab === 'links' || tab === 'stats')) {
			activeMobileTab = tab;
		}
	});

	let previewData = $state<{
		url: string;
		title: string | null;
		description: string | null;
		image: string | null;
		logo: string | null;
	} | null>(null);

	$effect(() => {
		if (!isAddDialogOpen) {
			editingLink = null;
			previewData = null;
		}
	});

	function handleAddLink() {
		editingLink = null;
		isAddDialogOpen = true;
	}

	function handleEditLink(link: Link) {
		editingLink = link;
		isAddDialogOpen = true;
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (isMobile.matches) {
			if (e.key === '1') activeMobileTab = 'spaces';
			if (e.key === '2') activeMobileTab = 'links';
			if (e.key === '3') activeMobileTab = 'stats';
		}
	}}
/>

<!-- Layout Container - Lazygit Style -->
<div
	class={cn(
		theme.app,
		'relative h-[99dvh] w-screen overflow-hidden bg-background p-1 md:p-2',
		!isMobile.matches ? '' : 'pb-15 '
	)}
>
	<div class="relative flex h-full overflow-hidden border-2 border-border shadow-xs">
		<!-- Main Content Area -->
		<div
			class="flex h-full w-full gap-0 overflow-hidden p-2 pt-3 md:gap-2 md:p-1 md:pb-6 lg:gap-4 lg:p-4 lg:pb-8"
		>
			<!-- Left Sidebar (Workspace/Categories) -->
			<aside
				class={cn(
					'hidden h-full min-w-0 overflow-y-auto p-2',
					activeMobileTab === 'spaces' && 'flex w-full flex-col gap-4',
					'md:flex! md:w-60 md:shrink-0 lg:w-75'
				)}
			>
				<LeftSidebar
					onAddLink={handleAddLink}
					onExport={() => (isExportDialogOpen = true)}
					onImport={() => (isImportDialogOpen = true)}
				/>
			</aside>

			<!-- Center Feed (Links) -->
			<main
				class={cn(
					theme.layoutContent,
					'hidden h-full min-w-0 flex-1 flex-col ',
					(activeMobileTab === 'links' || !isMobile.matches) && 'flex',
					'md:flex!'
				)}
			>
				<LazyPanel
					title="Links"
					titleClass={theme.titleBranches}
					focused={true}
					class="flex-1"
					counter={!isMobile.matches || activeMobileTab === 'links'
						? `${store.filters.filteredLinks.length} items`
						: undefined}
					contentClass="px-0 pt-5"
				>
					{#snippet subtitle()}
						<div class="ml-2 flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => store.settings.setViewMode('list')}
								class={cn(
									'h-5 rounded-none px-1.5 text-[10px] font-bold uppercase transition-none',
									store.settings.viewMode === 'list'
										? 'bg-primary text-primary-foreground hover:bg-primary/90'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								)}
							>
								[l]ist
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => store.settings.setViewMode('grid')}
								class={cn(
									'h-5 rounded-none px-1.5 text-[10px] font-bold uppercase transition-none',
									store.settings.viewMode === 'grid'
										? 'bg-primary text-primary-foreground hover:bg-primary/90'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground'
								)}
							>
								[g]rid
							</Button>
						</div>
					{/snippet}

					<!-- Unified Header (Add Link) -->
					<CenterHeader />

					<!-- Scrollable Feed Content -->
					<div class="mt-1 min-h-0 flex-1 overflow-hidden">
						<ScrollArea type="hover" class="h-full w-full">
							<div class="flex flex-col">
								{#if store.filters.filteredLinks.length === 0}
									<EmptyState onAdd={handleAddLink} />
								{:else if store.settings.viewMode === 'list'}
									<div class="flex flex-col">
										{#each store.filters.filteredLinks as link (link.id)}
											<LinkCard
												{link}
												viewMode="list"
												onedit={handleEditLink}
												onToggleFavorite={(id) => store.links.toggleFavorite(id as LinkId)}
												onToggleDeleted={(id) => store.links.toggleDeleted(id as LinkId)}
												onPermanentDelete={(id) => store.links.removePermanently(id as LinkId)}
												onUpdateTags={(id, tags) => store.links.update(id as LinkId, { tags })}
											/>
										{/each}
									</div>
								{:else}
									<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
										{#each store.filters.filteredLinks as link (link.id)}
											<LinkCard
												{link}
												viewMode="grid"
												onedit={handleEditLink}
												onToggleFavorite={(id) => store.links.toggleFavorite(id as LinkId)}
												onToggleDeleted={(id) => store.links.toggleDeleted(id as LinkId)}
												onPermanentDelete={(id) => store.links.removePermanently(id as LinkId)}
												onUpdateTags={(id, tags) => store.links.update(id as LinkId, { tags })}
											/>
										{/each}
									</div>
								{/if}

								<div class="h-8"></div>
							</div>
						</ScrollArea>
					</div>
				</LazyPanel>
			</main>

			<!-- Right Sidebar (Preview/Details) -->
			<aside
				class={cn(
					'hidden h-full min-w-0 overflow-y-auto p-2',
					activeMobileTab === 'stats' && 'flex w-full flex-col gap-4',
					'md:hidden lg:flex! lg:w-65 lg:shrink-0 xl:w-75'
				)}
			>
				<RightSidebar />
			</aside>
		</div>

		<!-- Status Bar -->
		<div class="absolute right-0 bottom-0 left-0 z-40 hidden md:flex">
			<LazyStatusBar />
		</div>
	</div>
</div>

<!-- Mobile Navigation Bar (TUI Style) -->
<div class="fixed right-0 bottom-0 left-0 z-50 block md:hidden">
	<TuiMobileNav bind:activeTab={activeMobileTab} />
</div>
