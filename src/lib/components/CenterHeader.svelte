<script lang="ts">
	import { X } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import TagInput from '$lib/components/TagInput.svelte';
	import { TUI } from '$lib/tui';
	import { defaultLogger } from '$lib/stores/infra/logger';

	const store = getContext<AppStore>('store');

	let urlInput = $state('');
	let isLoading = $state(false);
	let previewTags = $state<string[]>([]);

	let error = $state('');
	let inlinePreview = $state<{
		url: string;
		title: string | null;
		description: string | null;
		image: string | null;
		logo: string | null;
	} | null>(null);

	// TUI Spinner logic
	const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let frameIndex = $state(0);
	let lastFetchedUrl = $state('');

	$effect(() => {
		let interval: any;
		if (isLoading) {
			interval = setInterval(() => {
				frameIndex = (frameIndex + 1) % spinnerFrames.length;
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
			}, 500); // Debounce
			return () => clearTimeout(timeout);
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
			defaultLogger.error('Failed to fetch link preview', { error: err, url });
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
</script>

<div class="border-b border-border px-2 py-3 pt-0">
	<div class="flex flex-col gap-2">
		<!-- Prompt row -->
		<div class="flex items-center gap-2">
			<span class="text-[14px] font-bold text-primary">$</span>
			<div class="flex flex-1 items-center gap-2">
				<input
					bind:value={urlInput}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							if (inlinePreview) {
								handleSave();
							} else if (urlInput.trim()) {
								// Force fetch if Enter pressed before debounce
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
					class="w-full border-none bg-background font-mono text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50"
				/>
				{#if isLoading}
					<span class="w-4 text-center font-mono text-[14px] text-primary">
						{spinnerFrames[frameIndex]}
					</span>
				{:else if urlInput}
					<button
						onclick={() => {
							urlInput = '';
							inlinePreview = null;
							lastFetchedUrl = '';
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
			<div class="relative mt-2 border border-border bg-background">
				<div class="flex h-6 items-center justify-between border-b border-border bg-muted/30 px-2">
					<div class="flex items-center gap-2">
						<span class="text-[10px] font-bold tracking-tighter text-destructive uppercase"
							>Preview</span
						>
						{#if isLoading}
							<span class="animate-pulse text-[10px] text-primary italic">fetching metadata...</span
							>
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
				<div class="flex gap-3 p-3">
					{#if inlinePreview.image}
						<div class="h-16 w-24 shrink-0 overflow-hidden border border-border bg-muted/20">
							<img src={inlinePreview.image} alt="" class="h-full w-full object-cover" />
						</div>
					{:else}
						<div
							class="flex h-16 w-24 shrink-0 items-center justify-center border border-border bg-muted/10"
						>
							<span class="font-mono text-2xl text-muted-foreground/20">{TUI.bullet}</span>
						</div>
					{/if}
					<div class="min-w-0 flex-1">
						<h3 class="truncate text-[12px] font-bold text-foreground">
							{inlinePreview.title || inlinePreview.url}
						</h3>
						{#if inlinePreview.description}
							<p class="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
								{inlinePreview.description}
							</p>
						{/if}
						<div class="mt-2 border-t border-border/30 pt-2">
							<TagInput selected={previewTags} onchange={(tags) => (previewTags = tags)} />
						</div>
					</div>
				</div>
				<div
					class="flex items-center justify-end gap-3 border-t border-border/30 bg-muted/30 px-2 py-1"
				>
					<span class="text-[10px] text-muted-foreground">
						<span class="font-bold text-primary">[enter]</span> confirm & save
					</span>
					<span class="text-[10px] text-muted-foreground">
						<span class="font-bold text-destructive">[esc]</span> cancel
					</span>
				</div>
			</div>
		{/if}

		{#if error}
			<p class="font-mono text-[11px] text-destructive">{error}</p>
		{/if}
	</div>
</div>

