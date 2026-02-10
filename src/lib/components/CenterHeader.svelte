<script lang="ts">
	import { Loader2, X } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import TagInput from '$lib/components/TagInput.svelte';
	import { TUI } from '$lib/tui';

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

<div class="border-b border-border p-3 pt-0">
	<div class="flex flex-col gap-2">
		<!-- Prompt row -->
		<div class="flex items-center gap-2">
			<span class="text-primary font-bold text-[14px]">$</span>
			<div class="flex flex-1 items-center gap-2">
				<input
					bind:value={urlInput}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
					placeholder="Paste link to add..."
					class="w-full bg-background border-none outline-none text-foreground text-[13px] font-mono placeholder:text-muted-foreground/50"
				/>
				{#if isLoading}
					<Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
				{:else if urlInput}
					<button
						onclick={() => {
							urlInput = '';
							inlinePreview = null;
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
				<div class="flex h-6 items-center border-b border-border bg-muted/30 px-2 justify-between">
					<span class="text-[10px] font-bold text-destructive uppercase tracking-tighter">Preview</span>
					<button
						onclick={() => {
							inlinePreview = null;
						}}
						class="text-muted-foreground hover:text-foreground"
					>
						<X class="h-3 w-3" />
					</button>
				</div>
				<div class="flex gap-3 p-3">
					{#if inlinePreview.image}
						<div class="w-24 h-16 shrink-0 border border-border">
							<img src={inlinePreview.image} alt="" class="h-full w-full object-cover" />
						</div>
					{/if}
					<div class="flex-1 min-w-0">
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
				<div class="flex items-center justify-end gap-3 border-t border-border/30 px-2 py-1 bg-muted/30">
					<span class="text-[10px] text-muted-foreground">
						<span class="text-primary">enter</span>: save
					</span>
					<span class="text-[10px] text-muted-foreground">
						<span class="text-destructive">esc</span>: cancel
					</span>
				</div>
			</div>
		{/if}

		{#if error}
			<p class="text-[11px] font-mono text-destructive">{error}</p>
		{/if}
	</div>
</div>