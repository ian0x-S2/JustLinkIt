<script lang="ts">
	import type { Link } from '$lib/types';
	import { deleteLink, getFilteredLinks } from '$lib/store.svelte';
	import LinkItem from '$lib/components/LinkItem.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import WorkspaceHeader from '$lib/components/WorkspaceHeader.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import { FileText, Edit2 } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let showForm = $state(false);
	let editingLink = $state<Link | null>(null);
	let showExportDialog = $state(false);
	let viewMode = $state<'list' | 'grid'>('list');

	let filteredLinksList = $derived(getFilteredLinks());

	function handleEdit(link: Link) {
		editingLink = link;
		showForm = true;
	}

	function handleClose() {
		showForm = false;
		editingLink = null;
	}
</script>

<div class="flex flex-1 flex-col">
	<WorkspaceHeader 
		title="Inbox" 
		bind:viewMode
		onExport={() => (showExportDialog = true)} 
		onAddLink={() => (showForm = true)}
	/>

	<LinkForm link={editingLink ?? undefined} bind:open={showForm} onclose={handleClose} />
	<ExportDialog bind:open={showExportDialog} links={filteredLinksList} />

	<div class="flex-1 overflow-y-auto">
		{#if viewMode === 'list'}
			<div class="flex flex-col">
				{#each filteredLinksList as link (link.id)}
					<LinkItem {link} onedit={handleEdit} ondelete={deleteLink} />
				{:else}
					<div class="mt-20">
						<EmptyState />
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-6">
				{#each filteredLinksList as link (link.id)}
					<button 
						class="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20"
						onclick={() => window.open(link.url, '_blank')}
					>
						<div class="aspect-video w-full bg-muted overflow-hidden border-b">
							{#if link.image}
								<img src={link.image} alt="" class="h-full w-full object-cover transition-transform group-hover:scale-105" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-muted-foreground/20">
									<FileText class="h-12 w-12" />
								</div>
							{/if}
						</div>
						<div class="flex flex-1 flex-col p-4">
							<h3 class="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
								{link.title || link.url}
							</h3>
							{#if link.description}
								<p class="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
									{link.description}
								</p>
							{/if}
							
							{#if link.tags.length > 0}
								<div class="mt-4 flex flex-wrap gap-1.5">
									{#each link.tags as tag}
										<Badge variant="secondary" class="px-2 py-0.5 text-[10px] h-5 font-medium bg-muted/60 text-muted-foreground border-none">
											{tag}
										</Badge>
									{/each}
								</div>
							{/if}

							<div class="mt-auto pt-4 flex items-center justify-between text-[10px] text-muted-foreground">
								<span class="truncate max-w-[100px]">{new URL(link.url).hostname.replace('www.', '')}</span>
								<span>{formatDistanceToNow(link.createdAt, { addSuffix: true })}</span>
							</div>
						</div>

						<!-- Action Overlay for Grid -->
						<div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<Button 
								variant="secondary" 
								size="icon" 
								class="h-7 w-7 rounded-full bg-background/80 backdrop-blur"
								onclick={(e) => { e.stopPropagation(); handleEdit(link); }}
							>
								<Edit2 class="h-3.5 w-3.5" />
							</Button>
						</div>
					</button>
				{:else}
					<div class="col-span-full mt-20">
						<EmptyState />
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>


