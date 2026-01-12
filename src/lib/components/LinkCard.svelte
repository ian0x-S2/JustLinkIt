<script lang="ts">
	import type { Link } from '$lib/types';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ExternalLink, Edit2, Trash2, Sparkles } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';

	import { aiConfig, updateLink } from '$lib/store.svelte';
	import { generateSummary, suggestTags } from '$lib/ai-client';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();

	let imageError = $state(false);
	let aiLoading = $state(false);

	async function handleGenerateSummary() {
		if (aiLoading) return;
		aiLoading = true;
		try {
			const summary = await generateSummary(link.url, link.title, link.description);
			updateLink(link.id, { aiSummary: summary });
		} catch (error) {
			console.error(error);
		} finally {
			aiLoading = false;
		}
	}

	async function handleSuggestTags() {
		if (aiLoading) return;
		aiLoading = true;
		try {
			const newTags = await suggestTags(link.url, link.title, link.description);
			const uniqueTags = Array.from(new Set([...link.tags, ...newTags]));
			updateLink(link.id, { tags: uniqueTags });
		} catch (error) {
			console.error(error);
		} finally {
			aiLoading = false;
		}
	}

	function getRandomColor(seed: string): string {
		let hash = 0;
		for (let i = 0; i < seed.length; i++) {
			hash = (hash << 5) - hash + seed.charCodeAt(i);
			hash = hash & hash;
		}
		const hue = Math.abs(hash) % 360;
		const saturation = 60 + (Math.abs(hash) % 30);
		const lightness = 40 + (Math.abs(hash) % 20);
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	const bgColor = $derived(getRandomColor(link.url));
</script>

<div class="group flex gap-3 border-b p-4 transition-colors last:border-0 hover:bg-muted/30">
	<!-- Avatar/Icon Side -->
	<div class="shrink-0">
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-sm"
			style="background-color: {bgColor}"
		>
			{#if link.image && !imageError}
				<img
					src={link.image}
					alt=""
					class="h-full w-full object-cover"
					onerror={() => (imageError = true)}
				/>
			{:else}
				{link.title?.charAt(0).toUpperCase() || link.url.charAt(0).toUpperCase()}
			{/if}
		</div>
	</div>

	<!-- Content Side -->
	<div class="min-w-0 flex-1 space-y-2">
		<div class="flex items-center justify-between gap-2">
			<div class="flex min-w-0 items-center gap-1.5">
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="block truncate text-[15px] font-bold hover:underline"
				>
					{link.title || link.url}
				</a>
				<span class="truncate text-sm text-muted-foreground">
					{#if link.publisher}
						· {link.publisher}
					{/if}
					· {formatDistanceToNow(link.createdAt, { addSuffix: true })}
				</span>
			</div>
		</div>

		{#if link.description}
			<p class="wrap-break-wor text-[15px] leading-normal text-foreground/90">
				{link.description}
			</p>
		{/if}

		{#if link.image && !imageError}
			<div class="mt-3 max-w-lg overflow-hidden rounded-2xl border bg-muted/20">
				<img
					src={link.image}
					alt={link.title || 'Preview'}
					class="h-auto max-h-75 w-full object-cover"
				/>
			</div>
		{/if}

		{#if link.aiSummary}
			<div
				class="group/summary relative mt-3 rounded-2xl border border-purple-100/50 bg-purple-50/50 p-3 text-[14px]"
			>
				<div class="mb-1 flex items-center justify-between">
					<div
						class="flex items-center gap-1.5 text-xs font-bold tracking-wider text-purple-700 uppercase"
					>
						<Sparkles class="h-3 w-3" />
						AI Summary
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 text-purple-700 opacity-0 transition-opacity group-hover/summary:opacity-100 hover:bg-purple-100"
						onclick={() => updateLink(link.id, { aiSummary: undefined })}
					>
						<Trash2 class="h-3.5 w-3.5" />
					</Button>
				</div>
				<p class="leading-relaxed text-purple-900/80">{link.aiSummary}</p>
			</div>
		{/if}

		<div class="flex flex-wrap gap-1.5 pt-1">
			{#each link.tags as tag}
				<button class="text-[14px] text-primary hover:underline" onclick={() => {}}>
					#{tag}
				</button>
			{/each}

			{#if aiConfig.enabled && !aiLoading}
				<Button
					variant="ghost"
					size="sm"
					class="h-6 rounded-full px-2 text-[11px] text-purple-600 hover:bg-purple-50 hover:text-purple-700"
					onclick={handleSuggestTags}
				>
					<Sparkles class="mr-1 h-3 w-3" />
					Suggest Tags
				</Button>
			{/if}
		</div>

		<!-- Tweet-style Actions -->
		<div class="-ml-2 flex max-w-md items-center justify-between pt-2 text-muted-foreground">
			<Button
				variant="ghost"
				size="sm"
				class="h-8 gap-2 rounded-full px-3 hover:bg-primary/10 hover:text-primary"
				onclick={handleGenerateSummary}
				disabled={aiLoading || !aiConfig.enabled || !!link.aiSummary}
			>
				<Sparkles class="h-4.5 w-4.5" />
				<span class="text-xs">Summary</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				class="h-8 gap-2 rounded-full px-3 hover:bg-green-600/10 hover:text-green-600"
				onclick={() => onedit(link)}
			>
				<Edit2 class="h-4.5 w-4.5" />
				<span class="text-xs">Edit</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				class="h-8 gap-2 rounded-full px-3 hover:bg-destructive/10 hover:text-destructive"
				onclick={() => ondelete(link.id)}
			>
				<Trash2 class="h-4.5 w-4.5" />
				<span class="text-xs">Delete</span>
			</Button>

			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-8 rounded-full p-0 hover:bg-primary/10 hover:text-primary"
				onclick={() => window.open(link.url, '_blank')}
			>
				<ExternalLink class="h-4.5 w-4.5" />
			</Button>
		</div>
	</div>
</div>
