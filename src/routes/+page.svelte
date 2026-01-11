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
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import {
		Home,
		Hash,
		Sparkles,
		FileJson,
		FileText,
		Plus,
		Search,
		Loader2,
		X,
		Check,
		ChevronsUpDown
	} from '@lucide/svelte';

	let showForm = $state(false);
	let editingLink = $state<Link | null>(null);
	let showExportDialog = $state(false);
	let searchInput = $state('');
	let filteredLinksList = $state<Link[]>([]);

	// New Link Input State
	let newLinkUrl = $state('');
	let isFetchingOg = $state(false);
	let ogPreview = $state<Partial<Link> | null>(null);
	let tagInput = $state('');
	let tagPopoverOpen = $state(false);

	function addTagToPreview(tag: string) {
		const cleanTag = tag.trim().toLowerCase();
		if (cleanTag && ogPreview) {
			if (!ogPreview.tags) ogPreview.tags = [];
			if (!ogPreview.tags.includes(cleanTag)) {
				ogPreview.tags = [...ogPreview.tags, cleanTag];
			}
			tagInput = '';
			tagPopoverOpen = false;
		}
	}

	function removeTagFromPreview(tagToRemove: string) {
		if (ogPreview && ogPreview.tags) {
			ogPreview.tags = ogPreview.tags.filter((t) => t !== tagToRemove);
		}
	}

	$effect(() => {
		search.query = searchInput;
		filteredLinksList = getFilteredLinks();
	});

	// URL detection and metadata fetch
	$effect(() => {
		const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
		const match = newLinkUrl.match(urlPattern);
		
		if (match && match[0] && (!ogPreview || ogPreview.url !== match[0])) {
			handleUrlPaste(match[0]);
		}
	});

	async function handleUrlPaste(url: string) {
		isFetchingOg = true;
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			if (response.ok) {
				const data = await response.json();
				ogPreview = {
					url,
					title: data.title || '',
					description: data.description || '',
					image: data.image || '',
				tags: [],
				createdAt: Date.now()
				};
			}
		} catch (err) {
			console.error('Failed to fetch OG data', err);
		} finally {
			isFetchingOg = false;
		}
	}

	function clearPreview() {
		newLinkUrl = '';
		ogPreview = null;
		isFetchingOg = false;
		tagInput = '';
	}

	function handleQuickPost() {
		if (ogPreview && ogPreview.url) {
			addLink({
				url: ogPreview.url,
				title: ogPreview.title || '',
				description: ogPreview.description || '',
				image: ogPreview.image || '',
				tags: ogPreview.tags || [],
				createdAt: Date.now()
			});
			clearPreview();
		}
	}

	// Computed suggestions for tags
	let tagSuggestions = $derived(
		getAllTags().filter((t) => !ogPreview?.tags?.includes(t))
	);

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
		<div class="border-b p-4 pb-3">
			<div class="flex gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10"
				>
					<Plus class="h-6 w-6 text-primary" />
				</div>
				<div class="flex-1 space-y-3">
					<Input
						bind:value={newLinkUrl}
						placeholder="Paste a link here..."
						class="border-none bg-transparent px-0 py-2 text-xl shadow-none focus-visible:ring-0"
					/>

					{#if isFetchingOg}
						<div class="flex items-center gap-2 py-4 text-sm text-muted-foreground">
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Fetching link metadata...</span>
						</div>
					{:else if ogPreview}
						<div class="group relative mt-2">
							<button
								onclick={clearPreview}
								class="absolute -right-2 -top-2 z-10 rounded-full border bg-background p-1 shadow-sm transition-colors hover:bg-muted"
							>
								<X class="h-4 w-4" />
							</button>
							<div class="rounded-xl border bg-card shadow-sm relative">
								<div class="flex h-32 overflow-hidden rounded-t-xl">
									{#if ogPreview.image}
										<img
											src={ogPreview.image}
											alt={ogPreview.title}
											class="h-full w-40 object-cover border-r"
										/>
									{/if}
									<div class="flex flex-1 flex-col justify-center p-4">
										<h3 class="line-clamp-2 text-base font-bold leading-tight">{ogPreview.title}</h3>
										<p class="mt-1 line-clamp-2 text-sm text-muted-foreground">
											{ogPreview.description}
										</p>
										<p class="mt-2 truncate text-xs text-primary/60">{ogPreview.url}</p>
									</div>
								</div>
								
								<!-- Tags Section in Preview -->
								<div class="border-t bg-muted/20 p-3 rounded-b-xl overflow-visible">
									<div class="flex flex-wrap gap-2 items-center">
										{#each ogPreview.tags || [] as tag}
											<Badge variant="secondary" class="h-6 px-2 text-xs gap-1 rounded-md">
												#{tag}
												<button onclick={() => removeTagFromPreview(tag)} class="hover:text-destructive">
													<X class="h-3 w-3" />
												</button>
											</Badge>
										{/each}
										
										<Popover.Root bind:open={tagPopoverOpen}>
											<Popover.Trigger>
												{#snippet child({ props })}
													<Button
														{...props}
													variant="outline"
													size="sm"
													class="h-6 px-2 text-[10px] gap-1 border-dashed border-muted-foreground/30 hover:border-primary/50"
												>
													<Plus class="h-3 w-3" />
													Tag
												</Button>
											{/snippet}
											</Popover.Trigger>
											<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
												<Command.Root>
													<Command.Input 
														placeholder="Search tags..." 
														bind:value={tagInput}
													onkeydown={(e) => {
																if (e.key === 'Enter' && tagInput.trim()) {
																e.preventDefault();
																	addTagToPreview(tagInput);
															}
												}}
												
													/>
													<Command.List>
														<Command.Empty class="p-0">
															<Button 
																variant="ghost" 
															class="w-full justify-start text-[11px] h-8 gap-2 px-2 rounded-none hover:bg-accent"
														onclick={() => addTagToPreview(tagInput)}
													>
														<Plus class="size-3 text-primary" />
														<span>Create <span class="font-bold">"{tagInput}"</span></span>
													</Button>
												</Command.Empty>
													<Command.Group>
														{#each tagSuggestions as tag}
															<Command.Item
																value={tag}
														onSelect={() => addTagToPreview(tag)}
															class="text-xs"
													>
															<Hash class="size-3 mr-2 opacity-50" />
															{tag}
													</Command.Item>
												{/each}
													</Command.Group>
												</Command.List>
												</Command.Root>
											</Popover.Content>
										</Popover.Root>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Separator that spans full width (-mx-4 compensation for parent p-4) -->
			<div class="mt-3 flex items-center justify-between border-t pt-3 -mx-4 px-4">
				<div class="flex gap-1 text-primary">
					<!-- Toolbar space -->
				</div>
				<Button 
					onclick={handleQuickPost} 
					disabled={!ogPreview}
					class="rounded-full px-6 font-bold"
				>
					Post Link
				</Button>
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