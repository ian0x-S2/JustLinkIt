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
			hash = ((hash << 5) - hash) + seed.charCodeAt(i);
			hash = hash & hash;
		}
		const hue = Math.abs(hash) % 360;
		const saturation = 60 + (Math.abs(hash) % 30);
		const lightness = 40 + (Math.abs(hash) % 20);
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	const bgColor = $derived(getRandomColor(link.url));
</script>

<div class="flex gap-3 p-4 hover:bg-muted/30 transition-colors border-b last:border-0 group">
	<!-- Avatar/Icon Side -->
	<div class="shrink-0">
		<div 
			class="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0 shadow-sm"
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
	<div class="flex-1 min-w-0 space-y-2">
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-1.5 min-w-0">
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="font-bold hover:underline truncate text-[15px] block"
				>
					{link.title || link.url}
				</a>
				<span class="text-muted-foreground text-sm truncate">
					· {formatDistanceToNow(link.createdAt, { addSuffix: true })}
				</span>
			</div>
		</div>

		{#if link.description}
			<p class="text-[15px] leading-normal text-foreground/90 break-words">
				{link.description}
			</p>
		{/if}

		{#if link.image && !imageError}
			<div class="mt-3 rounded-2xl overflow-hidden border bg-muted/20 max-w-lg">
				<img
					src={link.image}
					alt={link.title || 'Preview'}
					class="w-full h-auto object-cover max-h-[300px]"
				/>
			</div>
		{/if}

		{#if link.aiSummary}
			<div class="mt-3 rounded-2xl bg-purple-50/50 p-3 text-[14px] border border-purple-100/50 relative group/summary">
				<div class="flex items-center justify-between mb-1">
					<div class="flex items-center gap-1.5 font-bold text-purple-700 text-xs uppercase tracking-wider">
						<Sparkles class="h-3 w-3" />
						AI Summary
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 opacity-0 group-hover/summary:opacity-100 transition-opacity text-purple-700 hover:bg-purple-100"
						onclick={() => updateLink(link.id, { aiSummary: undefined })}
					>
						<Trash2 class="h-3.5 w-3.5" />
					</Button>
				</div>
				<p class="text-purple-900/80 leading-relaxed">{link.aiSummary}</p>
			</div>
		{/if}

		<div class="flex flex-wrap gap-1.5 pt-1">
			{#each link.tags as tag}
				<button 
					class="text-primary hover:underline text-[14px]"
					onclick={() => {}} 
				>
					#{tag}
				</button>
			{/each}
			
			{#if aiConfig.enabled && !aiLoading}
				<Button
					variant="ghost"
					size="sm"
					class="h-6 px-2 text-[11px] text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-full"
					onclick={handleSuggestTags}
				>
					<Sparkles class="mr-1 h-3 w-3" />
					Suggest Tags
				</Button>
			{/if}
		</div>

		<!-- Tweet-style Actions -->
		<div class="flex items-center justify-between max-w-md pt-2 -ml-2 text-muted-foreground">
			<Button 
				variant="ghost" 
				size="sm" 
				class="h-8 gap-2 hover:text-primary hover:bg-primary/10 rounded-full px-3"
				onclick={handleGenerateSummary}
				disabled={aiLoading || !aiConfig.enabled || !!link.aiSummary}
			>
				<Sparkles class="h-4.5 w-4.5" />
				<span class="text-xs">Summary</span>
			</Button>
			
			<Button 
				variant="ghost" 
				size="sm" 
				class="h-8 gap-2 hover:text-green-600 hover:bg-green-600/10 rounded-full px-3"
				onclick={() => onedit(link)}
			>
				<Edit2 class="h-4.5 w-4.5" />
				<span class="text-xs">Edit</span>
			</Button>

			<Button 
				variant="ghost" 
				size="sm" 
				class="h-8 gap-2 hover:text-destructive hover:bg-destructive/10 rounded-full px-3"
				onclick={() => ondelete(link.id)}
			>
				<Trash2 class="h-4.5 w-4.5" />
				<span class="text-xs">Delete</span>
			</Button>

			<Button 
				variant="ghost" 
				size="sm" 
				class="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10 rounded-full"
				onclick={() => window.open(link.url, '_blank')}
			>
				<ExternalLink class="h-4.5 w-4.5" />
			</Button>
		</div>
	</div>
</div>

