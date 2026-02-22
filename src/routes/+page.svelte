<script lang="ts">
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import CenterHeader from '$lib/components/CenterHeader.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import AppDialogs from '$lib/components/AppDialogs.svelte';
	import LazyPanel from '$lib/components/tui/LazyPanel.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { AppStore } from '$lib/stores';
	import type { Link, LinkId } from '$lib/types';
	import { theme } from '$lib/tui';
	import { cn } from '$lib/utils';
	import { AppLayout } from '$lib/components/layout';

	const store = getContext<AppStore>('store');

	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let isImportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);
	let previewData = $state<any>(null);
	let activeMobileTab = $state<'spaces' | 'links' | 'stats'>('links');

	$effect(() => {
		const tab = page.url.searchParams.get('tab');
		if (tab && (tab === 'spaces' || tab === 'links' || tab === 'stats')) {
			activeMobileTab = tab;
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
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (e.key === '1') activeMobileTab = 'spaces';
		if (e.key === '2') activeMobileTab = 'links';
		if (e.key === '3') activeMobileTab = 'stats';

		if (e.key === 'l') store.settings.setViewMode('list');
		if (e.key === 'g') store.settings.setViewMode('grid');
		if (e.key === 's' || e.key === '/') {
			e.preventDefault();
			store.filters.setSearchMode(!store.filters.isSearchMode);
		}
	}}
/>

<AppLayout bind:activeMobileTab>
	{#snippet left()}
		<LeftSidebar
			onAddLink={handleAddLink}
			onExport={() => (isExportDialogOpen = true)}
			onImport={() => (isImportDialogOpen = true)}
		/>
	{/snippet}

	{#snippet main()}
		{#snippet LinkList(viewMode: 'list' | 'grid')}
			{#each store.filters.filteredLinks as link (link.id)}
				<LinkCard
					{link}
					{viewMode}
					onedit={handleEditLink}
					onToggleFavorite={(id) => store.links.toggleFavorite(id as LinkId)}
					onToggleDeleted={(id) => store.links.toggleDeleted(id as LinkId)}
					onPermanentDelete={(id) => store.links.removePermanently(id as LinkId)}
					onUpdateTags={(id, tags) => store.links.update(id as LinkId, { tags })}
				/>
			{/each}
		{/snippet}

		<LazyPanel
			title="Links"
			titleClass={theme.titleBranches}
			focused={true}
			class="flex-1"
			counter={`${store.filters.filteredLinks.length} items`}
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
					<Button
						variant="ghost"
						size="sm"
						onclick={() => store.filters.setSearchMode(!store.filters.isSearchMode)}
						class={cn(
							'h-5 rounded-none px-1.5 text-[10px] font-bold uppercase transition-none',
							store.filters.isSearchMode
								? 'bg-primary text-primary-foreground hover:bg-primary/90'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'
						)}
					>
						[s]earch
					</Button>
				</div>
			{/snippet}

			<CenterHeader />

			<div class="mt-1 min-h-0 flex-1 overflow-hidden">
				<ScrollArea type="hover" class="h-full w-full">
					<div class="flex flex-col">
						{#if store.filters.filteredLinks.length === 0}
							<EmptyState onAdd={handleAddLink} />
						{:else if store.settings.viewMode === 'list'}
							<div class="flex flex-col">
								{@render LinkList('list')}
							</div>
						{:else}
							<div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
								{@render LinkList('grid')}
							</div>
						{/if}

						<div class="h-8"></div>
					</div>
				</ScrollArea>
			</div>
		</LazyPanel>
	{/snippet}

	{#snippet right()}
		<RightSidebar />
	{/snippet}
</AppLayout>

<AppDialogs
	bind:isAddDialogOpen
	bind:isExportDialogOpen
	bind:isImportDialogOpen
	bind:editingLink
	bind:previewData
/>
