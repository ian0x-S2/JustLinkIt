<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, FileText, ExternalLink, Star, Archive, Pencil, RotateCcw } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();
	const store = getContext<AppStore>('store');
	let logoError = $state(false);
	let imageError = $state(false);
	let isDeleteDialogOpen = $state(false);

	function getDomain(url: string) {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}

	async function handlePermanentDelete() {
		await store.links.removePermanently(link.id);
		isDeleteDialogOpen = false;
	}
</script>

<div class="group flex flex-col px-4 py-3 transition-colors hover:bg-muted/30">
	<div class="flex gap-3">
		<!-- Left: Icon/Avatar -->
		<div class="flex shrink-0 flex-col items-center">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
			>
				{#if link.logo && !logoError}
					<img
						src={link.logo}
						alt=""
						class="h-7 w-7 rounded-sm object-contain"
						onerror={() => (logoError = true)}
					/>
				{:else}
					<FileText class="h-4.5 w-4.5" />
				{/if}
			</div>
		</div>

		<!-- Right: Content -->
		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<!-- Header: Title & Meta -->
			<div class="flex items-center justify-between gap-2">
				<div class="flex min-w-0 items-center gap-1.5">
					<span class="truncate text-[14px] leading-tight font-bold text-foreground">
						{getDomain(link.url)}
					</span>
					<span class="shrink-0 text-[14px] text-muted-foreground">·</span>
					<span class="shrink-0 text-[13px] text-muted-foreground">
						{formatDistanceToNow(link.createdAt, { addSuffix: false })}
					</span>
				</div>
			</div>

			<!-- Main Text -->
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-[14px] leading-snug text-foreground decoration-foreground/20 group-hover:underline"
			>
				<span class="mb-0.5 block font-bold">{link.title || link.url}</span>
				{#if link.description}
					<p class="line-clamp-2 text-[14px] leading-snug text-muted-foreground">
						{link.description}
					</p>
				{/if}
			</a>

			<!-- Attachment: Image Preview -->
			{#if link.image && !imageError}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="mt-2 block overflow-hidden rounded-sm border border-border transition-colors hover:bg-muted/10"
				>
					<div class="aspect-[2/1] w-full bg-muted/20">
						<img
							src={link.image}
							alt=""
							class="h-full w-full object-cover"
							onerror={() => (imageError = true)}
						/>
					</div>
					<div class="border-t border-border/40 p-2">
						<div class="flex items-center gap-1.5 text-[12px] text-muted-foreground">
							<ExternalLink class="h-3 w-3" />
							<span class="truncate">{getDomain(link.url)}</span>
						</div>
					</div>
				</a>
			{/if}

			<!-- Tags -->
			{#if link.tags.length > 0}
				<div class="mt-1.5 flex flex-wrap gap-1.5">
					{#each link.tags as tag (tag)}
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								store.filters.toggleTag(tag);
							}}
							class="text-[13px] font-medium text-primary hover:underline"
						>
							#{tag}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Actions: Bottom Row -->
			<div class="mt-2 -ml-1.5 flex max-w-sm items-center justify-between">
				{#if link.isDeleted}
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 rounded-sm text-primary transition-colors hover:bg-primary/10"
						onclick={(e) => {
							e.preventDefault();
							store.links.toggleDeleted(link.id);
						}}
						title="Restore link"
					>
						<RotateCcw class="h-4 w-4" />
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 rounded-sm {link.isFavorite
							? 'text-yellow-500'
							: 'text-muted-foreground'} transition-colors hover:bg-yellow-500/10 hover:text-yellow-500"
						onclick={(e) => {
							e.preventDefault();
							store.links.toggleFavorite(link.id);
						}}
					>
						<Star class="h-4 w-4 {link.isFavorite ? 'fill-current' : ''}" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 rounded-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
						onclick={(e) => {
							e.preventDefault();
							onedit(link);
						}}
					>
						<Pencil class="h-4 w-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						class="h-8 w-8 rounded-sm {link.isArchived
							? 'text-primary'
							: 'text-muted-foreground'} transition-colors hover:bg-primary/10 hover:text-primary"
						onclick={(e) => {
							e.preventDefault();
							store.links.toggleArchived(link.id);
						}}
					>
						<Archive class="h-4 w-4" />
					</Button>
				{/if}

				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8 rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
					onclick={(e) => {
						e.preventDefault();
						if (link.isDeleted) {
							isDeleteDialogOpen = true;
						} else {
							store.links.toggleDeleted(link.id);
						}
					}}
					title={link.isDeleted ? 'Delete permanently' : 'Move to trash'}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Delete permanently?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete the link
				<span class="font-bold text-foreground">"{link.title || link.url}"</span>.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={() => (isDeleteDialogOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={handlePermanentDelete}>Delete Permanently</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
