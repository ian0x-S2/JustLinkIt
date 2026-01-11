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
	<div class="container mx-auto max-w-4xl">
		<header class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-3xl font-bold">Links</h1>
				<p class="text-muted-foreground">Organize and discover your links</p>
			</div>
			<div class="flex gap-2">
				<Button onclick={handleAdd}>
					<Plus class="mr-2 h-4 w-4" />
					Add Link
				</Button>
				<Button variant="outline" onclick={() => (showExportDialog = true)}>
					<FileJson class="mr-2 h-4 w-4" />
					Export
				</Button>
			</div>
		</header>

		<div class="mb-6 space-y-4">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					bind:value={searchInput}
					placeholder="Search by title, URL, description, or tags..."
					class="pl-9"
				/>
			</div>

			{#if getAllTags().length > 0}
				<div class="flex flex-wrap gap-2">
					{#each getAllTags() as tag}
						<Badge
							variant={selectedTags.includes(tag) ? 'default' : 'outline'}
							class="cursor-pointer"
							onclick={() => toggleTag(tag)}
						>
							#{tag}
						</Badge>
					{/each}
					{#if selectedTags.length > 0}
						<Button variant="ghost" size="sm" onclick={clearSelectedTags}>Clear filters</Button>
					{/if}
				</div>
			{/if}
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

		<div class="space-y-4">
			{#each filteredLinksList as link (link.id)}
				<LinkCard
					{link}
					onedit={handleEdit}
					ondelete={deleteLink}
					ondeletesummary={handleDeleteSummary}
				/>
			{:else}
				<div
					class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center"
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
