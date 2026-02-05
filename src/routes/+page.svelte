<script lang="ts">
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import CenterHeader from '$lib/components/CenterHeader.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { Link, LinkId } from '$lib/types';

	const store = getContext<AppStore>('store');

	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let isPreviewLoading = $state(false);
	let editingLink = $state<Link | null>(null);
	let previewData = $state<{
		url: string;
		title: string | null;
		description: string | null;
		image: string | null;
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

	async function handleLinkPreview(url: string) {
		isPreviewLoading = true;
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			if (!response.ok) throw new Error('Failed to fetch preview');

			const data = await response.json();
			previewData = {
				url,
				title: data.title || null,
				description: data.description || null,
				image: data.image || null
			};

			// Open dialog with preview data
			isAddDialogOpen = true;
		} catch (err) {
			console.error('Failed to fetch link preview:', err);
			// Still open dialog without preview
			previewData = { url, title: null, description: null, image: null };
			isAddDialogOpen = true;
		} finally {
			isPreviewLoading = false;
		}
	}
</script>

<!-- Layout Container - centered like Twitter -->
<div class="mx-auto flex h-screen w-full max-w-[1265px]">
	<!-- Left Sidebar -->
	<LeftSidebar onAddLink={handleAddLink} onExport={() => (isExportDialogOpen = true)} />

	<!-- Center Feed -->
	<main class="flex h-screen w-[600px] flex-col border-x">
		<!-- Sticky Header with Input -->
		<CenterHeader />

		<!-- Scrollable Feed Content -->
		<div class="flex-1 overflow-hidden">
			<ScrollArea type="hover" class="h-full w-full">
				<div class="flex flex-col">
					{#if store.filters.filteredLinks.length === 0}
						<EmptyState onAdd={handleAddLink} />
					{:else}
						{#each store.filters.filteredLinks as link (link.id)}
							<div class="border-b transition-colors hover:bg-muted/30">
								<LinkCard {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
							</div>
						{/each}
					{/if}

					<!-- Bottom spacing -->
					<div class="h-20"></div>
				</div>
			</ScrollArea>
		</div>
	</main>

	<!-- Right Sidebar (hidden on mobile/tablet) -->
	<RightSidebar />
</div>

<!-- Dialogs -->
<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-md border p-0 shadow-2xl sm:max-w-2xl"
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
	<Dialog.Content class="rounded-md sm:max-w-md">
		<ExportDialog bind:open={isExportDialogOpen} links={store.filters.filteredLinks} />
	</Dialog.Content>
</Dialog.Root>
