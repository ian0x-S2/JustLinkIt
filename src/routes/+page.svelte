<script lang="ts">
	import WorkspaceHeader from '$lib/components/WorkspaceHeader.svelte';
	import LinkItem from '$lib/components/LinkItem.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { links, search } from '$lib/store.svelte';
	import type { Link } from '$lib/types';

	let viewMode = $state<'list' | 'grid'>('list');
	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);

	// Measurement logic
	let headerEl = $state<HTMLElement | null>(null);
	let headerHeight = $state(48);

	$effect(() => {
		if (headerEl) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (let entry of entries) {
					headerHeight = entry.target.clientHeight;
				}
			});
			resizeObserver.observe(headerEl);
			return () => resizeObserver.disconnect();
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
		links.remove(id);
	}
</script>

<!-- Header Section -->
<div bind:this={headerEl} class="shrink-0 w-full z-10 bg-background">
	<WorkspaceHeader
		title="Inbox"
		bind:viewMode
		onExport={() => (isExportDialogOpen = true)}
		onAddLink={handleAddLink}
	/>
</div>

<!-- Main Viewport Area -->
<div 
	class="flex-1 overflow-y-auto bg-background flex flex-col items-center"
	style="height: calc(100vh - {headerHeight}px);"
>
	<!-- 98% Width Container -->
	<div class="w-[98%] min-h-[calc(100%-1rem)] my-2 bg-muted/[0.04] border rounded-md flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
		
		<div class="flex-1 w-full flex flex-col {search.filteredLinks.length === 0 ? 'justify-center' : 'justify-start'}">
			
			<div class="w-full {viewMode === 'list' ? 'px-0 pt-0 pb-6' : 'px-3 md:px-6 lg:px-8 py-6'}">
				{#if (search.filteredLinks || []).length === 0}
					<EmptyState onAdd={handleAddLink} />
				{:else if viewMode === 'list'}
					<div class="flex flex-col border-b bg-background shadow-sm">
						{#each search.filteredLinks as link (link.id)}
							<LinkItem {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
						{/each}
					</div>
				{:else}
					<!-- Card Mode -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
						{#each search.filteredLinks as link (link.id)}
							<LinkCard {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
						{/each}
					</div>
				{/if}
			</div>

		</div>

		<!-- Safety bottom inset -->
		<div class="h-12 w-full shrink-0"></div>
	</div>
</div>

<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px] p-0 overflow-hidden rounded-md">
		<LinkForm
			link={editingLink}
			onsave={() => (isAddDialogOpen = false)}
			oncancel={() => (isAddDialogOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isExportDialogOpen}>
	<Dialog.Content class="sm:max-w-[500px] rounded-md">
		<ExportDialog onclose={() => (isExportDialogOpen = false)} />
	</Dialog.Content>
</Dialog.Root>