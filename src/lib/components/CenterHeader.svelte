<script lang="ts">
	import { X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import TagInput from '$lib/components/TagInput.svelte';
	import { TUI } from '$lib/tui';
	import { defaultLogger } from '$lib/stores/infra/logger';
	import { isValidUrl, extractUrl } from '$lib/utils/url';
	import { PreviewService, type LinkPreview } from '$lib/stores/infra/services/preview';
	import { APP_CONFIG } from '$lib/constants';
	import Input from './ui/input/input.svelte';

	const store = getContext<AppStore>('store');

	let urlInput = $state('');
	let isLoading = $state(false);
	let previewTags = $state<string[]>([]);

	let error = $state('');
	let inlinePreview = $state<LinkPreview | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);

	// TUI Spinner logic
	const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let spinnerFrameIndex = $state(0);
	let lastFetchedUrl = $state('');

	$effect(() => {
		if (store.filters.isSearchMode) {
			inputRef?.focus();
			inlinePreview = null;
			error = '';
			lastFetchedUrl = '';
			isLoading = false;
			return;
		}
	});

	$effect(() => {
		let interval: any;
		if (isLoading) {
			interval = setInterval(() => {
				spinnerFrameIndex = (spinnerFrameIndex + 1) % spinnerFrames.length;
			}, 80);
		}
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (!inlinePreview) {
			previewTags = [];
		}
	});

	// Automatic fetching logic
	$effect(() => {
		if (store.filters.isSearchMode) {
			inlinePreview = null;
			error = '';
			lastFetchedUrl = '';
			isLoading = false;
			return;
		}

		const trimmed = urlInput.trim();
		if (!trimmed) {
			inlinePreview = null;
			error = '';
			lastFetchedUrl = '';
			return;
		}

		const url = extractUrl(trimmed);
		if (url && url !== lastFetchedUrl && isValidUrl(url)) {
			const timeout = setTimeout(() => {
				lastFetchedUrl = url;
				fetchPreview(url);
			}, APP_CONFIG.SEARCH_DEBOUNCE_MS);
			return () => clearTimeout(timeout);
		}
	});

	async function fetchPreview(url: string) {
		isLoading = true;
		error = '';
		inlinePreview = await PreviewService.fetch(url);
		isLoading = false;
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
			defaultLogger.error('Failed to save link from header', { error: err });
			error = 'Failed to save link';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="border-b border-border px-3 py-2">
	<div class="flex flex-col gap-2">
		<!-- Prompt row -->
		<div class="flex items-center gap-2">
			<span class="text-base font-bold text-primary">{store.filters.isSearchMode ? '?' : '$'}</span>
			<div class="flex flex-1 items-center gap-2">
				{#if store.filters.isSearchMode}
					<Input
						bind:ref={inputRef}
						bind:value={store.filters.searchQuery}
						onkeydown={(e) => {
							if (e.key === 'Escape') {
								store.filters.setSearchQuery('');
								store.filters.setSearchMode(false);
							}
						}}
						placeholder="Search links..."
						class="w-full border-none bg-background  font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
					/>
				{:else}
					<Input
						bind:ref={inputRef}
						bind:value={urlInput}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								if (inlinePreview) {
									handleSave();
								} else if (urlInput.trim()) {
									const url = extractUrl(urlInput.trim());
									if (url && isValidUrl(url)) {
										fetchPreview(url);
									}
								}
							} else if (e.key === 'Escape') {
								urlInput = '';
								inlinePreview = null;
							}
						}}
						placeholder="Paste link to add..."
						class="w-full border-none bg-background font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
					/>
				{/if}
				{#if isLoading}
					<span class="w-4 text-center font-mono text-base text-primary">
						{spinnerFrames[spinnerFrameIndex]}
					</span>
				{:else if store.filters.isSearchMode ? store.filters.searchQuery : urlInput}
					<button
						onclick={() => {
							if (store.filters.isSearchMode) {
								store.filters.setSearchQuery('');
							} else {
								urlInput = '';
								inlinePreview = null;
								lastFetchedUrl = '';
							}
						}}
						class="text-muted-foreground hover:text-foreground"
					>
						<X class="h-3.5 w-3.5" />
					</button>
				{/if}
			</div>
		</div>

		<!-- Preview -->
		{#if inlinePreview}
			<div class="relative mt-1 border border-border bg-background">
				<div class="flex h-6 items-center justify-between border-b border-border bg-muted/30 px-2">
					<div class="flex items-center gap-2">
						<span class="text-xs font-bold tracking-tighter text-destructive uppercase"
							>Preview</span
						>
						{#if isLoading}
							<span class="animate-pulse text-xs text-primary italic">fetching metadata...</span>
						{/if}
					</div>
					<button
						onclick={() => {
							inlinePreview = null;
							lastFetchedUrl = '';
						}}
						class="text-muted-foreground hover:text-foreground"
					>
						<X class="h-3 w-3" />
					</button>
				</div>
				<div class="flex gap-2 p-2">
					{#if inlinePreview.image}
						<div class="h-14 w-20 shrink-0 overflow-hidden border border-border bg-muted/20">
							<img src={inlinePreview.image} alt="" class="h-full w-full object-cover" />
						</div>
					{:else}
						<div
							class="flex h-14 w-20 shrink-0 items-center justify-center border border-border bg-muted/10"
						>
							<span class="font-mono text-xl text-muted-foreground/20">{TUI.bullet}</span>
						</div>
					{/if}
					<div class="min-w-0 flex-1">
						<h3 class="truncate text-sm font-bold text-foreground">
							{inlinePreview.title || inlinePreview.url}
						</h3>
						{#if inlinePreview.description}
							<p class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
								{inlinePreview.description}
							</p>
						{/if}
						<div class="mt-1 border-t border-border/30 pt-1">
							<TagInput selected={previewTags} onchange={(tags) => (previewTags = tags)} />
						</div>
					</div>
				</div>
				<div
					class="flex items-center justify-end gap-3 border-t border-border/30 bg-muted/30 px-2 py-1"
				>
					<Button
						variant="ghost"
						onclick={handleSave}
						disabled={isLoading}
						class="h-auto p-0 font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground"
					>
						<span class="text-xs"
							><span class="font-bold text-primary">[enter]</span> confirm & save</span
						>
					</Button>
					<Button
						variant="ghost"
						onclick={() => {
							inlinePreview = null;
							urlInput = '';
							lastFetchedUrl = '';
						}}
						class="h-auto p-0 font-normal text-muted-foreground hover:bg-transparent! hover:text-foreground"
					>
						<span class="text-xs"><span class="font-bold text-destructive">[esc]</span> cancel</span
						>
					</Button>
				</div>
			</div>
		{/if}

		{#if error}
			<p class="font-mono text-xs text-destructive">{error}</p>
		{/if}
	</div>
</div>
