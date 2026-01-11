<script lang="ts">
	import type { Link } from '$lib/types';
	import {
		search,
		selectedTags,
		getAllTags,
		deleteLink,
		toggleSelectedTag,
		clearSelectedTags,
		getFilteredLinks
	} from '$lib/store.svelte';
	import { addLink, updateLink } from '$lib/store.svelte';
	import LinkCard from '$lib/components/LinkCard.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Search, Sparkles, FileJson, FileText } from '@lucide/svelte';

	let showForm = $state(false);
	let editingLink = $state<Link | null>(null);
	let showExportDialog = $state(false);
	let searchInput = $state('');
	let filteredLinksList = $state<Link[]>([]);

	$effect(() => {
		search.query = searchInput;
		filteredLinksList = getFilteredLinks();
	});

	function handleEdit(link: Link) {
		editingLink = link;
		showForm = true;
	}

	function handleAdd() {
		editingLink = null;
		showForm = true;
	}

	function handleClose() {
		showForm = false;
		editingLink = null;
	}

	function toggleTag(tag: string) {
		toggleSelectedTag(tag);
	}

	function handleClearFilters() {
		clearSelectedTags();
	}

	async function exportToJSON() {
		const data = JSON.stringify(filteredLinksList, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showExportDialog = false;
	}

	async function exportToMarkdown() {
		let markdown = '# Links Export\n\n';
		filteredLinksList.forEach((link) => {
			markdown += `## ${link.title || link.url}\n\n`;
			markdown += `${link.url}\n\n`;
			if (link.description) {
				markdown += `${link.description}\n\n`;
			}
			if (link.tags.length > 0) {
				markdown += `Tags: ${link.tags.join(', ')}\n\n`;
			}
			if (link.aiSummary) {
				markdown += `**AI Summary:** ${link.aiSummary}\n\n`;
			}
			markdown += '---\n\n';
		});
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.md`;
		a.click();
		URL.revokeObjectURL(url);
		showExportDialog = false;
	}

	function handleDeleteSummary(id: string) {
		updateLink(id, { aiSummary: undefined });
	}
</script>

<div>
	<div class="mx-auto max-w-2xl border-x min-h-screen bg-background">
		<!-- Sticky Header -->
		<header class="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
			<div class="px-4 py-3 flex items-center justify-between">
				<h1 class="text-xl font-bold tracking-tight">Home</h1>
				<div class="flex gap-2">
					<Button variant="ghost" size="icon" onclick={() => (showExportDialog = true)} title="Export">
						<FileJson class="h-5 w-5" />
					</Button>
				</div>
			</div>
			
			<!-- Search & Filters in Header Area -->
			<div class="px-4 pb-3 space-y-3">
				<div class="relative">
					<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:value={searchInput}
						placeholder="Search links..."
						class="pl-9 bg-muted/50 border-none rounded-full h-10 focus-visible:ring-primary"
					/>
				</div>

				{#if getAllTags().length > 0}
					<div class="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
						{#each getAllTags() as tag}
							<Badge
								variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
								class="cursor-pointer rounded-full px-3 py-1 text-xs border-none"
								onclick={() => toggleTag(tag)}
							>
								#{tag}
							</Badge>
						{/each}
						{#if selectedTags.length > 0}
							<Button variant="ghost" size="sm" class="h-7 text-xs rounded-full" onclick={clearSelectedTags}>Clear</Button>
						{/if}
					</div>
				{/if}
			</div>
		</header>

		<!-- "What's happening?" Style Input Area -->
		<div class="p-4 border-b flex gap-3">
			<div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
				<Plus class="h-6 w-6 text-primary" />
			</div>
			<div class="flex-1">
				<button 
					class="w-full text-left px-0 py-2 text-xl text-muted-foreground hover:bg-transparent border-none focus:ring-0"
					onclick={handleAdd}
				>
					Add a new link...
				</button>
				<div class="flex justify-between items-center mt-4 pt-2 border-t">
					<div class="flex gap-1 text-primary">
						<Button variant="ghost" size="icon" class="h-9 w-9 rounded-full" onclick={handleAdd}>
							<Plus class="h-5 w-5" />
						</Button>
					</div>
					<Button onclick={handleAdd} class="rounded-full px-6 font-bold">
						Post Link
					</Button>
				</div>
			</div>
		</div>

		<LinkForm link={editingLink ?? undefined} bind:open={showForm} onclose={handleClose} />

		{#if showExportDialog}
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
				<div class="w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
					<h2 class="text-xl font-semibold">Export Links</h2>
					<p class="text-sm text-muted-foreground">Export your links as JSON or Markdown</p>
					<div class="grid gap-2">
						<Button variant="outline" onclick={exportToJSON}>
							<FileJson class="mr-2 h-4 w-4" />
							Export as JSON
						</Button>
						<Button variant="outline" onclick={exportToMarkdown}>
							<FileText class="mr-2 h-4 w-4" />
							Export as Markdown
						</Button>
					</div>
					<Button variant="ghost" onclick={() => (showExportDialog = false)}>Cancel</Button>
				</div>
			</div>
		{/if}

		<div class="divide-y">
			{#each filteredLinksList as link (link.id)}
				<LinkCard
					{link}
					onedit={handleEdit}
					ondelete={deleteLink}
				/>
			{:else}
				<div
					class="flex flex-col items-center justify-center p-12 text-center"
				>
					<Search class="mb-4 h-12 w-12 text-muted-foreground" />
					<h3 class="text-lg font-semibold">No links found</h3>
					<p class="text-muted-foreground">
						{#if search.query || selectedTags.length > 0}
							Try adjusting your search or filters
						{:else}
							Add your first link to get started
						{/if}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
