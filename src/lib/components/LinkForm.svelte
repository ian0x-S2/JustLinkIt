<script lang="ts">
	import type { Link } from '$lib/types';
	import { addLink, updateLink } from '$lib/store.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Save, Loader2, X, Globe, Tag, Type, AlignLeft } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		link?: Link | null;
		onsave: () => void;
		oncancel: () => void;
	}

	let { link = null, onsave, oncancel }: Props = $props();

	let url = $state('');
	let title = $state('');
	let description = $state('');
	let tags = $state('');
	let image = $state('');
	let isSaving = $state(false);
	let isLoadingPreview = $state(false);

	$effect(() => {
		if (link) {
			url = link.url || '';
			title = link.title || '';
			description = link.description || '';
			tags = link.tags.join(', ') || '';
			image = link.image || '';
		} else {
			url = '';
			title = '';
			description = '';
			tags = '';
			image = '';
		}
	});

	async function fetchOpenGraphPreview() {
		if (!browser || !url) return;
		isLoadingPreview = true;
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.title && !title) title = data.title;
				if (data.description && !description) description = data.description;
				if (data.image && !image) image = data.image;
			}
		} catch {
			// Ignore
		} finally {
			isLoadingPreview = false;
		}
	}

	async function handleSubmit() {
		if (!url.trim()) return;
		isSaving = true;
		try {
			const tagList = tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);

			const linkData = {
				url: url.trim(),
				title: title.trim() || null,
				description: description.trim() || null,
				image: image.trim() || null,
				tags: tagList
			};

			if (link?.id) {
				updateLink(link.id, linkData);
			} else {
				addLink(linkData);
			}
			onsave();
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex flex-col h-full bg-background antialiased text-foreground">
	<!-- Header: Linear Style -->
	<div class="px-6 py-4 border-b flex items-center justify-between bg-muted/5">
		<div class="flex items-center gap-2.5">
			<div class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
				<Globe class="h-3.5 w-3.5" />
			</div>
			<h2 class="text-[14px] font-semibold tracking-tight">
				{link ? 'Edit link' : 'Save new link'}
			</h2>
		</div>
	</div>

	<!-- Body: Spacing and Icons -->
	<div class="px-8 py-8 space-y-7 overflow-y-auto max-h-[75vh]">
		
		<!-- URL Field -->
		<div class="space-y-2.5">
			<div class="flex items-center gap-2">
				<Globe class="h-3.5 w-3.5 text-muted-foreground/60" />
				<Label for="url" class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">URL</Label>
			</div>
			<div class="flex gap-2">
				<Input
					id="url"
					bind:value={url}
					placeholder="https://example.com"
					class="h-10 bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
				/>
				<Button
					variant="outline"
					onclick={fetchOpenGraphPreview}
					disabled={!url || isLoadingPreview}
					class="h-10 px-4 bg-background border-muted-foreground/10 hover:bg-muted/30"
				>
					{#if isLoadingPreview}
						<Loader2 class="h-3.5 w-3.5 animate-spin mr-2" />
					{/if}
					Auto-fill
				</Button>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<!-- Title Field -->
			<div class="space-y-2.5">
				<div class="flex items-center gap-2">
					<Type class="h-3.5 w-3.5 text-muted-foreground/60" />
					<Label for="title" class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Title</Label>
				</div>
				<Input
					id="title"
					bind:value={title}
					placeholder="Enter a descriptive title"
					class="h-10 bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
				/>
			</div>

			<!-- Tags Field -->
			<div class="space-y-2.5">
				<div class="flex items-center gap-2">
					<Tag class="h-3.5 w-3.5 text-muted-foreground/60" />
					<Label for="tags" class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Tags</Label>
				</div>
				<Input
					id="tags"
					bind:value={tags}
					placeholder="comma, separated, tags"
					class="h-10 bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md"
				/>
			</div>
		</div>

		<!-- Description -->
		<div class="space-y-2.5">
			<div class="flex items-center gap-2">
				<AlignLeft class="h-3.5 w-3.5 text-muted-foreground/60" />
				<Label for="description" class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Description</Label>
			</div>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="Add more context or notes about this link..."
				rows={3}
				class="resize-none bg-muted/20 border-muted-foreground/10 focus-visible:ring-1 focus-visible:ring-primary/40 rounded-md py-3"
			/>
		</div>

		{#if image}
			<div class="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
				<div class="relative aspect-[21/9] rounded-md border border-muted-foreground/10 overflow-hidden bg-muted/20 shadow-inner">
					<img src={image} alt="Preview" class="h-full w-full object-cover" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
					<Button
						variant="ghost"
						size="icon"
						class="absolute top-2 right-2 h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm rounded-md"
						onclick={() => (image = '')}
					>
						<X class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer: Clean and Solid -->
	<div class="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
		<div class="text-[11px] text-muted-foreground/50 font-medium">
			Press <span class="px-1.5 py-0.5 rounded border bg-background font-mono">Esc</span> to cancel
		</div>
		<div class="flex items-center gap-3">
			<Button variant="ghost" onclick={oncancel} class="h-9 px-4 text-[13px] font-medium text-muted-foreground hover:text-foreground">
				Cancel
			</Button>
			<Button onclick={handleSubmit} disabled={isSaving || !url.trim()} class="h-9 px-5 text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-md">
				{#if isSaving}
					<Loader2 class="h-3.5 w-3.5 animate-spin mr-2" />
					Saving...
				{:else}
					{link ? 'Update link' : 'Create link'}
				{/if}
			</Button>
		</div>
	</div>
</div>
