<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import { formatRelativeTime } from '$lib/tui';
	import TagInput from '$lib/components/TagInput.svelte';
	import { Globe } from '@lucide/svelte';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		onToggleFavorite: (id: string) => void;
		onToggleDeleted: (id: string) => void;
		onDeleteRequest: () => void;
		onUpdateTags: (id: string, tags: string[]) => void;
	}

	let {
		link,
		onedit,
		onToggleFavorite,
		onToggleDeleted,
		onDeleteRequest,
		onUpdateTags
	}: Props = $props();

	let logoError = $state(false);
	let logoLoaded = $state(false);
	let imageError = $state(false);

	$effect(() => {
		void link.id;
		logoError = false;
		logoLoaded = false;
		imageError = false;
	});

	function getDomain(url: string) {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

<div
	class={cn(
		'group flex flex-col border border-border/50 bg-card/5',
		'transition-all duration-200 hover:border-primary/50'
	)}
>
	<!-- TUI Header for Card -->
	<div class="flex h-6 items-center justify-between border-b border-border/50 bg-muted/20 px-2">
		<div class="flex items-center gap-2 truncate">
			<button
				onclick={() => onToggleFavorite(link.id)}
				class={cn(
					'flex h-4 w-4 shrink-0 items-center justify-center transition-transform hover:scale-110',
					link.isFavorite ? 'text-chart-3' : 'text-muted-foreground/30 hover:text-primary'
				)}
			>
				{#if link.logo && !logoError}
					<div class="relative flex h-3 w-3 items-center justify-center">
						{#if !logoLoaded}
							<Globe class="absolute inset-0 h-3 w-3 opacity-50" />
						{/if}
						<img
							src={link.logo}
							alt=""
							class={cn(
								'h-3 w-3 object-contain transition-opacity duration-200',
								logoLoaded ? 'opacity-100' : 'opacity-0'
							)}
							onerror={() => (logoError = true)}
							onload={() => (logoLoaded = true)}
						/>
					</div>
				{:else}
					<Globe class="h-3 w-3" />
				{/if}
			</button>
			<span class="truncate font-mono text-[10px] text-primary">{getDomain(link.url)}</span>
		</div>
		<span class="text-[9px] text-muted-foreground">{formatRelativeTime(link.createdAt)}</span>
	</div>

	<!-- Image / Content -->
	<div class="aspect-video w-full overflow-hidden bg-muted/10">
		{#if link.image && !imageError}
			<img
				src={link.image}
				alt={link.title}
				class="h-full w-full object-cover"
				onerror={() => (imageError = true)}
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-muted-foreground/20">
				<Globe class="h-10 w-10 stroke-[1.5px] opacity-20" />
			</div>
		{/if}
	</div>

	<!-- Footer Info -->
	<div class="flex flex-col gap-1 p-2">
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			class="line-clamp-1 text-[12px] font-bold text-foreground transition-colors hover:text-primary"
		>
			{link.title || link.url}
		</a>

		<div class="mt-1">
			<TagInput selected={link.tags} onchange={(tags) => onUpdateTags(link.id, tags)} />
		</div>

		<!-- Actions for Card -->
		<div class="mt-4 flex items-center gap-2 py-2">
			{#if link.isDeleted}
				<Button
					variant="ghost"
					size="sm"
					class="h-auto px-1 text-[9px] font-bold text-primary uppercase transition-none"
					onclick={(e) => {
						e.preventDefault();
						onToggleDeleted(link.id);
					}}
				>
					[r]estore
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="h-auto px-1 text-[9px] font-bold text-destructive uppercase transition-none"
					onclick={(e) => {
						e.preventDefault();
						onDeleteRequest();
					}}
				>
					[d]el perm
				</Button>
			{:else}
				<Button
					variant="ghost"
					size="sm"
					class={cn(
						'h-auto px-1 text-[9px] font-bold uppercase transition-none',
						link.isFavorite ? 'text-chart-3' : 'text-primary'
					)}
					onclick={(e) => {
						e.preventDefault();
						onToggleFavorite(link.id);
					}}
				>
					[f]av
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="h-auto px-1 text-[9px] font-bold text-primary uppercase transition-none"
					onclick={(e) => {
						e.preventDefault();
						onedit(link);
					}}
				>
					[e]dit
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="h-auto px-1 text-[9px] font-bold text-destructive uppercase transition-none "
					onclick={(e) => {
						e.preventDefault();
						onToggleDeleted(link.id);
					}}
				>
					[d]el
				</Button>
			{/if}
		</div>
	</div>
</div>
