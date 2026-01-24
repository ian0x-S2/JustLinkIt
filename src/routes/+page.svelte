<script lang="ts">
	import WorkspaceHeader from '$lib/components/WorkspaceHeader.svelte';
	import LinkItem from '$lib/components/LinkItem.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { links, search, deleteLink } from '$lib/store.svelte';
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

	$effect(() => {
		if (!isAddDialogOpen) {
			editingLink = null;
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
		deleteLink(id);
	}
</script>

<!-- Header Section -->
<div bind:this={headerEl} class="z-10 w-full shrink-0 bg-background">
	<WorkspaceHeader
		bind:viewMode
		onExport={() => (isExportDialogOpen = true)}
		onAddLink={handleAddLink}
	/>
</div>

<!-- Main Viewport Area -->
<div
	class="flex flex-1 flex-col items-center overflow-hidden bg-background"
	style="height: calc(100vh - {headerHeight}px);"
>
	<!-- 98% Width Container with Scroll Area -->
	<ScrollArea
		type="hover"
		class="my-2 flex min-h-[calc(100%-1rem)] w-[98%] flex-col rounded-md border bg-muted/4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
	>
			<div
				class="flex w-full flex-1 flex-col {search.filteredLinks.length === 0
					? 'justify-center'
					: 'justify-start'}"
			>
				<div class="w-full {viewMode === 'list' ? 'px-0 pt-0 pb-6' : 'px-3 py-6 md:px-6 lg:px-8'}">
					{#if (search.filteredLinks || []).length === 0}
						<EmptyState onAdd={handleAddLink} />
					{:else if viewMode === 'list'}
						<div class="flex flex-col border-b bg-background">
							{#each search.filteredLinks as link (link.id)}
								<LinkItem {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
							{/each}
						</div>
					{:else}
						<!-- Card Mode -->
						<div
							class="3xl:grid-cols-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
						>
							{#each search.filteredLinks as link (link.id)}
								<LinkCard {link} onedit={handleEditLink} ondelete={handleDeleteLink} />
							{/each}
						</div>
					{/if}
				</div>
			</div>

					<!-- Safety bottom inset -->
					<div class="h-12 w-full shrink-0"></div>
				</ScrollArea>
			</div>
			<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content class="overflow-hidden rounded-lg border-none p-0 shadow-2xl sm:max-w-[640px]">
		<LinkForm
			link={editingLink}
			onsave={() => (isAddDialogOpen = false)}
			oncancel={() => (isAddDialogOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isExportDialogOpen}>
	<Dialog.Content class="rounded-md sm:max-w-[500px]">
		<ExportDialog bind:open={isExportDialogOpen} links={search.filteredLinks} />
	</Dialog.Content>
</Dialog.Root>
