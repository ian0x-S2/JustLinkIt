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

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
		ondeletesummary?: (id: string) => void;
	}

	let { link, onedit, ondelete, ondeletesummary }: Props = $props();

	let imageError = $state(false);

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
			<div class="mt-3 rounded-lg bg-purple-50 p-3 text-sm">
				<div class="flex items-center gap-1 font-semibold text-purple-700">
					<Sparkles class="h-3 w-3" />
					AI Summary
				</div>
				<p class="mt-1 text-purple-600">{link.aiSummary}</p>
			</div>
		{/if}

		{#if link.tags.length > 0}
			<div class="mt-3 flex flex-wrap gap-1">
				{#each link.tags as tag}
					<Badge variant="secondary" class="text-xs">#{tag}</Badge>
				{/each}
			</div>
		{/if}
	</CardHeader>

	<CardFooter class="flex items-center justify-between text-xs text-muted-foreground">
		<time>{formatDistanceToNow(link.createdAt, { addSuffix: true })}</time>
		<div class="flex gap-2">
			<Button variant="ghost" size="sm" onclick={() => onedit(link)}>
				<Edit2 class="h-4 w-4" />
			</Button>
			{#if link.aiSummary && ondeletesummary}
				<Button variant="ghost" size="sm" onclick={() => ondeletesummary(link.id)}>
					<Sparkles class="h-4 w-4" />
				</Button>
			{/if}
			<Button variant="ghost" size="sm" onclick={() => ondelete(link.id)}>
				<Trash2 class="h-4 w-4" />
			</Button>
		</div>
	</CardFooter>
</Card>
