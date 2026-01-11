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

<Card class="overflow-hidden transition-shadow hover:shadow-md">
	<div class="aspect-video w-full overflow-hidden" style="background-color: {bgColor}">
		{#if link.image && !imageError}
			<img
				src={link.image}
				alt={link.title || 'Link preview'}
				class="h-full w-full object-cover"
				onerror={() => (imageError = true)}
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<div class="text-4xl font-bold text-white/60">
						{#if link.title}
							{link.title.charAt(0).toUpperCase()}
						{:else}
							{link.url.charAt(0).toUpperCase()}
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<CardHeader>
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 space-y-1">
				<CardTitle>
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1 hover:underline"
					>
						{link.title || link.url}
						<ExternalLink class="h-4 w-4" />
					</a>
				</CardTitle>
				{#if link.description}
					<CardDescription class="line-clamp-2">{link.description}</CardDescription>
				{/if}
			</div>
		</div>

		{#if link.aiSummary}
			<div class="mt-3 rounded-lg bg-purple-50 p-3 text-sm border border-purple-100">
				<div class="flex items-center justify-between font-semibold text-purple-700">
					<div class="flex items-center gap-1">
						<Sparkles class="h-3 w-3" />
						AI Summary
					</div>
					<Button
						variant="ghost"
						size="icon"
						class="h-6 w-6 text-purple-700 hover:text-purple-800 hover:bg-purple-100"
						onclick={() => updateLink(link.id, { aiSummary: undefined })}
					>
						<Trash2 class="h-3.5 w-3.5" />
					</Button>
				</div>
				<p class="mt-1 text-purple-600 leading-relaxed">{link.aiSummary}</p>
			</div>
		{/if}

		<div class="mt-3 flex flex-wrap gap-1">
			{#each link.tags as tag}
				<Badge variant="secondary" class="text-xs">#{tag}</Badge>
			{/each}
			{#if aiConfig.enabled && !aiLoading}
				<Button
					variant="outline"
					size="sm"
					class="h-5 px-2 text-[10px] border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
					onclick={handleSuggestTags}
				>
					<Sparkles class="mr-1 h-3 w-3" />
					Suggest Tags
				</Button>
			{/if}
		</div>
	</CardHeader>

	<CardFooter class="flex items-center justify-between text-xs text-muted-foreground">
		<time>{formatDistanceToNow(link.createdAt, { addSuffix: true })}</time>
		<div class="flex gap-1">
			{#if aiConfig.enabled && !link.aiSummary}
				<Button
					variant="ghost"
					size="sm"
					class="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
					onclick={handleGenerateSummary}
					disabled={aiLoading}
				>
					<Sparkles class="h-4 w-4" />
				</Button>
			{/if}
			<Button variant="ghost" size="sm" class="h-8 w-8 p-0" onclick={() => onedit(link)}>
				<Edit2 class="h-4 w-4" />
			</Button>
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
				onclick={() => ondelete(link.id)}
			>
				<Trash2 class="h-4 w-4" />
			</Button>
		</div>
	</CardFooter>
</Card>
