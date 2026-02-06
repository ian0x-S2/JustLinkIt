<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, Link2, Loader2, Ellipsis, X, Globe } from '@lucide/svelte';
	import { getContext, onMount } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import TagInput from '$lib/components/TagInput.svelte';

	const store = getContext<AppStore>('store');

	let mounted = $state(false);
	let urlInput = $state('');
	let isLoading = $state(false);
	let previewTags = $state<string[]>([]);

	onMount(() => {
		mounted = true;
	});

	let error = $state('');
	let inlinePreview = $state<{
		url: string;
		title: string | null;
		description: string | null;
		image: string | null;
		logo: string | null;
	} | null>(null);

	$effect(() => {
		if (!inlinePreview) {
			previewTags = [];
		}
	});

	$effect(() => {
		if (!urlInput.trim()) {
			inlinePreview = null;
			error = '';
		}
	});

	function isValidUrl(string: string): boolean {
		try {
			new URL(string);
			return true;
		} catch {
			return false;
		}
	}

	function extractUrl(text: string): string | null {
		const urlRegex = /(https?:\/\/[^\s]+)/;
		const match = text.match(urlRegex);
		if (match) return match[0];
		if (text.includes('.') && !text.includes(' ')) {
			return `https://${text}`;
		}
		return null;
	}

	async function fetchPreview(url: string) {
		isLoading = true;
		error = '';
		try {
			const response = await fetch('/api/opengraph', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			if (!response.ok) throw new Error('Failed to fetch preview');
			const data = await response.json();
			inlinePreview = {
				url,
				title: data.title || null,
				description: data.description || null,
				image: data.image || null,
				logo: data.logo || null
			};
		} catch (err) {
			console.error('Failed to fetch link preview:', err);
			inlinePreview = { url, title: null, description: null, image: null, logo: null };
		} finally {
			isLoading = false;
		}
	}

	async function handleSave() {
		if (!inlinePreview) return;
		isLoading = true;
		try {
			await store.links.add({
				url: inlinePreview.url,
				title: inlinePreview.title,
				description: inlinePreview.description,
				image: inlinePreview.image,
				logo: inlinePreview.logo,
				tags: [...previewTags],
				workspaceId: store.workspaces.activeId
			});
			inlinePreview = null;
			urlInput = '';
			previewTags = [];
		} catch (err) {
			error = 'Failed to save link';
		} finally {
			isLoading = false;
		}
	}

	async function handleSubmit(e: KeyboardEvent | MouseEvent) {
		if (e instanceof KeyboardEvent && e.key !== 'Enter') return;

		// If we already have a preview, Enter saves it
		if (inlinePreview) {
			await handleSave();
			return;
		}

		const url = extractUrl(urlInput.trim());
		if (!url) {
			error = 'Please enter a valid URL';
			return;
		}
		if (!isValidUrl(url)) {
			error = 'Invalid URL format';
			return;
		}

		await fetchPreview(url);
	}

	// Derived title to ensure stability during hydration
	const displayTitle = $derived.by(() => {
		const category = store.filters.activeCategory;
		if (category === 'inbox') return 'Home';
		return category.charAt(0).toUpperCase() + category.slice(1);
	});
</script>

<div class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
	<!-- Top Bar -->
	<div class="flex h-12 items-center border-b px-4">
		<h1 class="text-[15px] font-bold tracking-tight">
			{displayTitle}
		</h1>
		<div class="ml-auto flex items-center gap-1.5">
			{#if mounted}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<Ellipsis class="h-4 w-4" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56 rounded-sm shadow-xl" align="end">
						<DropdownMenu.Label
							class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
							>Filter View</DropdownMenu.Label
						>
						<DropdownMenu.Separator />
						<DropdownMenu.Item
							onclick={() => store.filters.setCategory('inbox')}
							class="flex items-center justify-between py-2 {store.filters.activeCategory ===
							'inbox'
								? 'font-bold'
								: ''}"
						>
							<span class="text-[13px]">Inbox</span>
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => store.filters.setCategory('favorites')}
							class="flex items-center justify-between py-2 {store.filters.activeCategory ===
							'favorites'
								? 'font-bold'
								: ''}"
						>
							<span class="text-[13px]">Favorites</span>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Label
							class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
							>Tags</DropdownMenu.Label
						>
						{#if store.filters.allTags.length > 0}
							<div class="max-h-[200px] overflow-y-auto p-1">
								{#each store.filters.allTags as tag (tag)}
									<DropdownMenu.Item
										onclick={() => store.filters.toggleTag(tag)}
										class="flex items-center gap-2 py-1.5 {store.filters.selectedTags.includes(tag)
											? 'bg-muted font-bold'
											: ''}"
									>
										<span class="text-[12px] text-muted-foreground">#</span>
										<span class="truncate text-[13px]">{tag}</span>
									</DropdownMenu.Item>
								{/each}
							</div>
						{/if}
						{#if store.filters.selectedTags.length > 0}
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => store.filters.clearTags()}
								class="py-2 font-medium text-destructive"
							>
								<span class="text-[13px]">Clear all filters</span>
							</DropdownMenu.Item>
						{/if}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</div>
	</div>

	<!-- Tweet Composer Style Input -->
	<div class="border-b border-border px-4 py-3">
		<div class="flex items-start gap-3">
			<div
				class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary"
			>
				<Link2 class="h-4 w-4" />
			</div>
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<div class="flex items-start justify-between gap-2">
					<Input
						bind:value={urlInput}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
						onpaste={(e) => {
							const pastedData = e.clipboardData?.getData('text');
							if (pastedData) {
								const url = extractUrl(pastedData.trim());
								if (url && isValidUrl(url)) {
									setTimeout(() => {
										fetchPreview(url);
									}, 50);
								}
							}
						}}
						placeholder="What's the link today?"
						class="h-9 border-0 bg-transparent px-0 text-[15px] placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					<div class="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center text-primary/60">
						{#if isLoading}
							<Loader2 class="h-4 w-4 animate-spin" />
						{:else if inlinePreview}
							<Globe class="h-4 w-4 duration-300 animate-in fade-in zoom-in" />
						{:else if urlInput}
							<button
								onclick={() => {
									urlInput = '';
									inlinePreview = null;
								}}
								class="flex h-5 w-5 items-center justify-center rounded-sm transition-colors hover:bg-muted hover:text-foreground"
								title="Clear input"
							>
								<X class="h-3.5 w-3.5" />
							</button>
						{/if}
					</div>
				</div>

				{#if inlinePreview}
					<div class="relative mt-1 w-full max-w-full">
						<button
							onclick={() => {
								inlinePreview = null;
								urlInput = '';
							}}
							class="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-sm border bg-background/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
						>
							<X class="h-3 w-3" />
						</button>
						<div class="w-full overflow-hidden rounded-sm border border-border/60 bg-muted/20">
							{#if inlinePreview.image}
								<div class="aspect-video w-full border-b border-border bg-muted/40">
									<img src={inlinePreview.image} alt="" class="h-full w-full object-cover" />
								</div>
							{/if}
							<div class="p-2.5">
								<h3 class="truncate text-[13px] leading-tight font-bold">
									{inlinePreview.title || inlinePreview.url}
								</h3>
								{#if inlinePreview.description}
									<p class="mt-0.5 line-clamp-1 text-[12px] leading-snug text-muted-foreground">
										{inlinePreview.description}
									</p>
								{/if}
								<div class="mt-2.5 border-t border-border pt-2">
									<TagInput selected={previewTags} onchange={(tags) => (previewTags = tags)} />
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if error}
					<p class="text-[12px] font-medium text-destructive">{error}</p>
				{/if}

				<div class="flex items-center justify-end pt-1">
					{#if inlinePreview && !isLoading}
						<Button
							type="button"
							size="sm"
							onclick={handleSave}
							class="flex items-center gap-1.5 rounded-sm bg-primary/5 px-2 py-1 text-[11px] font-bold text-primary transition-colors animate-in fade-in slide-in-from-right-1 hover:bg-primary/10 active:scale-95"
						>
							<span>Press Enter or click to save</span>
							<span class="text-[10px] opacity-50">↵</span>
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
