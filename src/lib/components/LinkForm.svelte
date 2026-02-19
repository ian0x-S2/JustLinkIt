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

<div class="flex h-full flex-col bg-background font-mono text-foreground">
	<!-- Header - Lazygit style -->
	<div class="flex h-9 items-center justify-between border-b border-border bg-muted/50 px-3">
		<div class="flex items-center gap-2">
			<span class="text-[11px] font-bold tracking-tight text-foreground uppercase">
				{link ? 'Edit Link' : 'Add Link'}
			</span>
		</div>
		<div class="flex items-center gap-4 text-[9px]">
			<div class="flex items-center gap-1 text-muted-foreground">
				<span
					class="border border-border bg-muted px-1 py-0.5 text-[7px] font-bold text-foreground uppercase"
					>esc</span
				>
				<span>cancel</span>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onclick={oncancel}
				class="h-6 w-6 rounded-none border border-transparent hover:border-border hover:bg-muted"
			>
				<X class="h-3.5 w-3.5" />
			</Button>
		</div>
	</div>

	<!-- Body -->
	<div class="max-h-[85vh] flex-1 space-y-6 overflow-y-auto px-4 py-6">
		<!-- URL Field -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<Globe class="h-4 w-4 text-primary" />
				<Label
					for="url"
					class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">URL</Label
				>
			</div>
			<div class="flex gap-2">
				<Input
					id="url"
					bind:value={url}
					placeholder="https://example.com"
					class={cn(
						'h-9 flex-1 rounded-none border border-border bg-muted/10 font-mono text-[13px]',
						'focus-visible:border-primary focus-visible:bg-background focus-visible:ring-0'
					)}
				/>
				<Button
					variant="outline"
					onclick={fetchOpenGraphPreview}
					disabled={!url || isLoadingPreview}
					class="h-9 rounded-none border border-border bg-background px-4 text-[12px] font-bold uppercase transition-all hover:bg-muted active:scale-95"
				>
					{#if isLoadingPreview}
						<Loader class="mr-2 h-3.5 w-3.5 animate-spin" />
					{/if}
					Fetch
				</Button>
			</div>
		</div>

		<!-- Title Field -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<Type class="h-4 w-4 text-primary" />
				<Label
					for="title"
					class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Title</Label
				>
			</div>
			<Input
				id="title"
				bind:value={title}
				placeholder="Give it a name..."
				class={cn(
					'h-9 rounded-none border border-border bg-muted/10 font-mono text-[13px]',
					'focus-visible:border-primary focus-visible:bg-background focus-visible:ring-0'
				)}
			/>
		</div>

		<!-- Tags Field -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<Tag class="h-4 w-4 text-primary" />
				<Label
					for="tags"
					class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Tags</Label
				>
			</div>
			<TagInput selected={tags} onchange={(newTags) => (tags = newTags)} />
		</div>

		<!-- Description -->
		<div class="space-y-2">
			<div class="flex items-center gap-2">
				<TextAlignStart class="h-4 w-4 text-primary" />
				<Label
					for="description"
					class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
					>Description</Label
				>
			</div>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="What makes this link interesting?"
				rows={3}
				class={cn(
					'min-h-24 resize-none rounded-none border border-border bg-muted/10 px-3 py-2 font-mono text-[13px] leading-relaxed',
					'focus-visible:border-primary focus-visible:bg-background focus-visible:ring-0'
				)}
			/>
		</div>

		{#if image}
			<div class="pt-2">
				<div class="relative aspect-video overflow-hidden border border-border bg-muted/20">
					<img src={image} alt="Preview" class="h-full w-full object-cover" />
					<Button
						variant="secondary"
						size="icon"
						class="absolute top-2 right-2 h-7 w-7 rounded-none border border-border bg-background shadow-lg hover:bg-muted"
						onclick={() => (image = '')}
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div
		class="mt-auto flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-4 py-3"
	>
		<Button
			variant="ghost"
			onclick={oncancel}
			class="h-8 rounded-none border border-border bg-background px-4 text-[11px] font-bold uppercase transition-colors hover:bg-muted"
		>
			Cancel
		</Button>
		<Button
			onclick={handleSubmit}
			disabled={isSaving || !url.trim()}
			class="h-8 rounded-none border border-primary bg-primary px-5 text-[11px] font-bold text-primary-foreground uppercase shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
		>
			{#if isSaving}
				<Loader class="mr-2 h-3.5 w-3.5 animate-spin" />
			{/if}
			{link ? 'Save changes' : 'Add link'}
		</Button>
	</div>
</div>
