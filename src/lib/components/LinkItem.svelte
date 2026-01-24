<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Edit2, Trash2, MoreHorizontal, FileText, Star, Archive, RotateCcw } from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';
	import { getContext } from 'svelte';
	import type { LinkStore } from '$lib/store.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();
	const store = getContext<LinkStore>('store');

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

<div class="group border-b bg-background transition-all last:border-0 hover:bg-muted/3">
	<div class="flex items-center gap-4 px-4 py-2.5">
		<!-- Preview: More Geometric -->
		<div class="shrink-0">
			<div
				class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border bg-muted/20 text-muted-foreground transition-colors group-hover:border-border"
			>
				{#if link.image && !imageError}
					<img
						src={link.image}
						alt=""
						class="h-full w-full object-cover"
						onerror={() => (imageError = true)}
					/>
				{:else}
					<FileText class="h-4.5 w-4.5 opacity-30" />
				{/if}
			</div>
		</div>

		<!-- Content: High Precision -->
		<div class="flex min-w-0 flex-1 items-center gap-6">
			<div class="min-w-0 flex-1 py-0.5">
				<div class="flex flex-col gap-0.5">
					<div class="flex items-center gap-2">
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="truncate text-[13.5px] leading-tight font-semibold text-foreground transition-colors hover:text-primary"
						>
							{link.title || link.url}
						</a>
						<span class="shrink-0 text-[11px] font-medium text-muted-foreground/40">
							{getDomain(link.url)}
						</span>
					</div>
					{#if link.description}
						<p
							class="line-clamp-1 text-[12.5px] leading-normal font-normal text-muted-foreground/60"
						>
							{link.description}
						</p>
					{/if}
				</div>
			</div>

			<!-- Tags: Rectangular (Linear) -->
			<div class="hidden max-w-60 shrink-0 items-center gap-1 overflow-hidden lg:flex">
				{#each link.tags as tag (tag)}
					<Badge
						variant="secondary"
						class="h-5 rounded-lg border border-transparent bg-muted/40 px-1.5 text-[10px] font-medium text-muted-foreground/80 transition-all hover:border-border"
					>
						{tag}
					</Badge>
				{/each}
			</div>

			<!-- Metadata -->
			<div
				class="hidden w-24 shrink-0 text-right text-[11px] font-medium text-muted-foreground/40 sm:block"
			>
				{formatDistanceToNow(link.createdAt, { addSuffix: true })}
			</div>

			<!-- Actions -->
			<div class="flex shrink-0 items-center gap-1">
				<Popover.Root bind:open={actionsOpen}>
					<Popover.Trigger
						class={cn(
							buttonVariants({ variant: 'ghost', size: 'icon' }),
							'h-7 w-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
						)}
					>
						<MoreHorizontal class="h-3.5 w-3.5" />
					</Popover.Trigger>
					<Popover.Content align="end" class="w-44 rounded-lg p-1 shadow-md">
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
								<Edit2 class="mr-2 h-3 w-3" />
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
										store.toggleFavorite(link.id);
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
										store.toggleArchived(link.id);
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
										store.toggleDeleted(link.id);
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
										store.toggleDeleted(link.id); // Move to trash
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
