<script lang="ts">
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import CenterHeader from '$lib/components/CenterHeader.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import LazyStatusBar from '$lib/components/tui/LazyStatusBar.svelte';
	import LazyPanel from '$lib/components/tui/LazyPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { Link, LinkId } from '$lib/types';
	import { theme } from '$lib/tui';
	import { cn } from '$lib/utils';

	const store = getContext<AppStore>('store');

	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);

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

<!-- Layout Container - Lazygit Style -->
<div class="h-screen w-screen overflow-hidden bg-background p-2 sm:p-4">
	<div class={cn(theme.app, "relative border-2 border-border shadow-2xl")}>
		<!-- Main Content Area -->
		<div class={theme.layoutMain}>
			<!-- Left Sidebar (Workspace/Categories) -->
			<LeftSidebar onAddLink={handleAddLink} onExport={() => (isExportDialogOpen = true)} />

			<!-- Center Feed (Links) -->
			<div class={theme.layoutContent}>
				<LazyPanel
					title="Links"
					titleClass={theme.titleBranches}
					focused={true}
					class="flex-1"
					counter="{store.filters.filteredLinks.length} items"
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

					<!-- Sticky Header with Input -->
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
									<div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
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

								<!-- Bottom spacing -->
								<div class="h-4"></div>
							</div>
						</ScrollArea>
					</div>
				</LazyPanel>
			</div>

			<!-- Right Sidebar (Preview/Details) -->
			<RightSidebar />
		</div>

		<!-- Lazygit-style Status Bar -->
		<LazyStatusBar />
	</div>
</div>

<!-- Dialogs -->
<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-border bg-background p-0 shadow-2xl sm:max-w-2xl"
	>
		<LinkForm
			link={editingLink}
			{previewData}
			onsave={() => (isAddDialogOpen = false)}
			oncancel={() => (isAddDialogOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isExportDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-border bg-background p-0 sm:max-w-md"
	>
		<ExportDialog bind:open={isExportDialogOpen} links={store.filters.filteredLinks} />
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(body) {
		background-color: black;
		margin: 0;
		padding: 0;
	}
</style>