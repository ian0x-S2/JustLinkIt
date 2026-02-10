<script lang="ts">
	import type { Link } from '$lib/types';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import TagInput from '$lib/components/TagInput.svelte';
	import { X, Globe, Tag, Type, Loader, TextAlignStart } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils.js';
	import { TUI } from '$lib/tui';

	interface Props {
		link?: Link | null;
		previewData?: {
			url: string;
			title: string | null;
			description: string | null;
			image: string | null;
			logo: string | null;
		} | null;
		onsave: () => void;
		oncancel: () => void;
	}

	let { link = null, previewData = null, onsave, oncancel }: Props = $props();

	const store = getContext<AppStore>('store');

	let url = $state('');
	let title = $state('');
	let description = $state('');
	let tags = $state<string[]>([]);
	let image = $state('');
	let logo = $state('');
	let isSaving = $state(false);
	let isLoadingPreview = $state(false);

	$effect(() => {
		if (link) {
			url = link.url || '';
			title = link.title || '';
			description = link.description || '';
			tags = [...link.tags];
			image = link.image || '';
			logo = link.logo || '';
		} else if (previewData) {
			// New link with preview data
			url = previewData.url || '';
			title = previewData.title || '';
			description = previewData.description || '';
			image = previewData.image || '';
			logo = previewData.logo || '';
			tags = [];
		} else {
			url = '';
			title = '';
			description = '';
			tags = [];
			image = '';
			logo = '';
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
				if (data.logo && !logo) logo = data.logo;
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
			const linkData = {
				url: url.trim(),
				title: title.trim() || null,
				description: description.trim() || null,
				image: image.trim() || null,
				logo: logo.trim() || null,
				tags: tags,
				workspaceId: store.workspaces.activeId
			};

			if (link?.id) {
				await store.links.update(link.id, linkData);
			} else {
				await store.links.add(linkData);
			}
			onsave();
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex h-full flex-col bg-background text-foreground">
	<!-- Header - Lazygit style -->
	<div class="flex h-8 items-center justify-between border-b border-border bg-muted px-3">
		<span
			class="flex items-center gap-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
		>
			<span>{TUI.topLeft}</span>
			<span>{link ? 'Edit Link' : 'Add Link'}</span>
		</span>
		<div class="flex items-center gap-3 text-[10px] text-muted-foreground">
			<span>
				<span class="rounded bg-secondary px-1 text-secondary-foreground">esc</span> cancel
			</span>
			<Button
				variant="ghost"
				size="icon"
				onclick={oncancel}
				class="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground"
			>
				<X class="h-3 w-3" />
			</Button>
		</div>
	</div>

	<!-- Body -->
	<div class="max-h-[85vh] flex-1 space-y-4 overflow-y-auto px-4 py-4">
		<!-- URL Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2">
				<Globe class="h-3.5 w-3.5 text-muted-foreground" />
				<Label for="url" class="text-[12px] font-medium text-muted-foreground">URL</Label>
			</div>
			<div class="flex gap-2">
				<Input
					id="url"
					bind:value={url}
					placeholder="https://example.com"
					class={cn(
						'h-9 flex-1 border-2 bg-muted/10 text-[13px]',
						'focus-visible:bg-background focus-visible:ring-0 focus-visible:ring-offset-0'
					)}
				/>
				<Button
					variant="outline"
					onclick={fetchOpenGraphPreview}
					disabled={!url || isLoadingPreview}
					class="h-9 border-2 px-3 text-[12px] font-medium"
				>
					{#if isLoadingPreview}
						<Loader class="mr-1.5 h-3.5 w-3.5 animate-spin" />
					{/if}
					Fetch
				</Button>
			</div>
		</div>

		<!-- Title Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2">
				<Type class="h-3.5 w-3.5 text-muted-foreground" />
				<Label for="title" class="text-[12px] font-medium text-muted-foreground">Title</Label>
			</div>
			<Input
				id="title"
				bind:value={title}
				placeholder="Give it a name..."
				class={cn(
					'h-9 border-2 bg-muted/10 text-[13px]',
					'focus-visible:bg-background focus-visible:ring-0 focus-visible:ring-offset-0'
				)}
			/>
		</div>

		<!-- Tags Field -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2">
				<Tag class="h-3.5 w-3.5 text-muted-foreground" />
				<Label for="tags" class="text-[12px] font-medium text-muted-foreground">Tags</Label>
			</div>
			<TagInput selected={tags} onchange={(newTags) => (tags = newTags)} />
		</div>

		<!-- Description -->
		<div class="space-y-1.5">
			<div class="flex items-center gap-2">
				<TextAlignStart class="h-3.5 w-3.5 text-muted-foreground" />
				<Label for="description" class="text-[12px] font-medium text-muted-foreground"
					>Description</Label
				>
			</div>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="What makes this link interesting?"
				rows={3}
				class={cn(
					'min-h-20 resize-none border-2 bg-muted/10 px-3 py-2 text-[13px] leading-relaxed',
					'focus-visible:bg-background focus-visible:ring-0 focus-visible:ring-offset-0'
				)}
			/>
		</div>

		{#if image}
			<div class="pt-1">
				<div class="relative aspect-video overflow-hidden border border-border">
					<img src={image} alt="Preview" class="h-full w-full object-cover" />
					<Button
						variant="secondary"
						size="icon"
						class="absolute top-2 right-2 h-7 w-7 border bg-background hover:bg-background"
						onclick={() => (image = '')}
					>
						<X class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="mt-auto flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
		<Button
			variant="ghost"
			onclick={oncancel}
			class="h-8 px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
		>
			Cancel
		</Button>
		<Button
			onclick={handleSubmit}
			disabled={isSaving || !url.trim()}
			class="h-8 px-4 text-[12px] font-medium"
		>
			{#if isSaving}
				<Loader class="mr-1.5 h-3 w-3 animate-spin" />
			{/if}
			{link ? 'Save changes' : 'Add link'}
		</Button>
	</div>
</div>
