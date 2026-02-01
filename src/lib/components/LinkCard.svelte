<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Trash2,
		FileText,
		ExternalLink,
		Star,
		Archive,
		RotateCcw,
		Ellipsis,
		Pencil
	} from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();
	const store = getContext<AppStore>('store');
	let imageError = $state(false);
	let actionsOpen = $state(false);

	function getDomain(url: string) {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

<div
	class="group flex h-full flex-col overflow-hidden rounded-md border p-1 transition-all hover:border-primary/20"
>
	<div
		class="group relative flex h-full flex-col overflow-hidden rounded-md border bg-background transition-all hover:border-primary/20"
	>
		<!-- Top: Preview Image -->
		<div class="relative aspect-video w-full overflow-hidden border-b bg-muted/20">
			{#if link.image && !imageError}
				<img
					src={link.image}
					alt=""
					class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					onerror={() => (imageError = true)}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<FileText class="h-8 w-8 text-muted-foreground/20" />
				</div>
			{/if}

			<!-- Domain Badge Overlay -->
			<div class="absolute bottom-2 left-2">
				<span
					class="rounded-lg border bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur-sm"
				>
					{getDomain(link.url)}
				</span>
			</div>
		</div>

		<!-- Middle: Content -->
		<div class="flex flex-1 flex-col gap-2 p-3.5">
			<div class="flex flex-col gap-1">
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="line-clamp-2 text-[14px] leading-tight font-semibold text-foreground transition-colors hover:text-primary"
				>
					{link.title || link.url}
				</a>
				{#if link.description}
					<p class="line-clamp-2 text-[12px] leading-normal text-muted-foreground/70">
						{link.description}
					</p>
				{/if}
			</div>

			<!-- Tags -->
			<div class="mt-auto flex flex-wrap gap-1 pt-2">
				{#each link.tags.slice(0, 3) as tag (tag)}
					<Badge
						variant="secondary"
						class="h-4.5 rounded-[3px] border-transparent bg-muted/50 px-1.5 text-[9px] font-medium text-muted-foreground"
					>
						{tag}
					</Badge>
				{/each}
				{#if link.tags.length > 3}
					<span class="self-center text-[9px] text-muted-foreground/50"
						>+{link.tags.length - 3}</span
					>
				{/if}
			</div>
		</div>

		<!-- Bottom: Actions & Meta -->
		<div class="flex items-center justify-between border-t bg-muted/2 px-3.5 py-2.5">
			<span class="text-[10px] font-medium tracking-tight text-muted-foreground/40 uppercase">
				{formatDistanceToNow(link.createdAt, { addSuffix: true })}
			</span>

			<div class="flex items-center gap-0.5">
				<Button
					variant="ghost"
					size="icon"
					class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
					onclick={() => window.open(link.url, '_blank')}
				>
					<ExternalLink class="h-3.5 w-3.5" />
				</Button>

				<Popover.Root bind:open={actionsOpen}>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'icon' }),
							'h-7 w-7 rounded-md text-muted-foreground hover:text-foreground'
						)}
					>
						<Ellipsis class="h-3.5 w-3.5" />
					</Popover.Trigger>
					<Popover.Content align="end" class="w-44 rounded-md border p-1 shadow-lg">
						<div class="flex flex-col gap-0.5">
							<Button
								variant="ghost"
								size="sm"
								class="h-8 justify-start rounded-md px-2 text-[12px] font-medium"
								onclick={() => {
									onedit(link);
									actionsOpen = false;
								}}
							>
								<Pencil class="mr-2 h-3 w-3" />
								<span>Edit</span>
							</Button>

							{#if !link.isDeleted}
								<Button
									variant="ghost"
									size="sm"
									class="h-8 justify-start rounded-md px-2 text-[12px] font-medium {link.isFavorite
										? 'text-yellow-500'
										: ''}"
									onclick={() => {
										store.links.toggleFavorite(link.id);
										actionsOpen = false;
									}}
								>
									<Star class="mr-2 h-3 w-3 {link.isFavorite ? 'fill-current' : ''}" />
									<span>{link.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}</span>
								</Button>

								<Button
									variant="ghost"
									size="sm"
									class="h-8 justify-start rounded-md px-2 text-[12px] font-medium"
									onclick={() => {
										store.links.toggleArchived(link.id);
										actionsOpen = false;
									}}
								>
									<Archive class="mr-2 h-3 w-3" />
									<span>{link.isArchived ? 'Unarchive' : 'Archive'}</span>
								</Button>
							{/if}

							{#if link.isDeleted}
								<Button
									variant="ghost"
									size="sm"
									class="h-8 justify-start rounded-md px-2 text-[12px] font-medium"
									onclick={() => {
										store.links.toggleDeleted(link.id);
										actionsOpen = false;
									}}
								>
									<RotateCcw class="mr-2 h-3 w-3" />
									<span>Restore</span>
								</Button>
							{/if}

							<div class="my-1 h-px bg-border"></div>

							<Button
								variant="ghost"
								size="sm"
								class="h-8 justify-start rounded-md px-2 text-[12px] font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
								onclick={() => {
									if (link.isDeleted) {
										ondelete(link.id); // Permanent delete
									} else {
										store.links.toggleDeleted(link.id); // Move to trash
									}
									actionsOpen = false;
								}}
							>
								<Trash2 class="mr-2 h-3 w-3" />
								<span>{link.isDeleted ? 'Delete Permanently' : 'Delete'}</span>
							</Button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	</div>
</div>
