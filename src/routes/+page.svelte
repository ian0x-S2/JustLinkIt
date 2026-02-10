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
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { Link, LinkId } from '$lib/types';
	import { theme } from '$lib/tui';

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

	function handleDeleteLink(id: string) {
		store.links.removePermanently(id as LinkId);
	}
</script>

<!-- Layout Container - Lazygit Style -->
<div class="h-screen w-screen bg-background p-2 sm:p-4 overflow-hidden">
	<div class="{theme.app} border-2 border-border shadow-2xl relative">
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
				>
					<!-- Sticky Header with Input -->
					<CenterHeader />

					<!-- Scrollable Feed Content -->
					<div class="flex-1 overflow-hidden mt-1">
						<ScrollArea type="hover" class="h-full w-full">
							<div class="flex flex-col">
								{#if store.filters.filteredLinks.length === 0}
									<EmptyState onAdd={handleAddLink} />
								{:else}
									{#each store.filters.filteredLinks as link (link.id)}
										<LinkCard {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
									{/each}
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
		class="overflow-hidden rounded-none border-2 border-white bg-black p-0 shadow-2xl sm:max-w-2xl"
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
	<Dialog.Content showCloseButton={false} class="overflow-hidden rounded-none border-2 border-white bg-black p-0 sm:max-w-md">
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