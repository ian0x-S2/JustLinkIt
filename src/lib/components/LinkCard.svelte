<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils.js';
	import { TUI, formatRelativeTime } from '$lib/tui';
	import TagInput from '$lib/components/TagInput.svelte';
	import { Ellipsis, Star, Pencil, Trash2 } from '@lucide/svelte';

	interface Props {
		link: Link;
		viewMode?: 'list' | 'grid';
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, viewMode = 'list', onedit, ondelete }: Props = $props();
	const store = getContext<AppStore>('store');

	let isDeleteDialogOpen = $state(false);

	async function updateTags(tags: string[]) {
		await store.links.update(link.id, { tags });
	}

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

{#snippet ActionMenuContent()}
	<DropdownMenu.Content
		align="end"
		class="min-w-[140px] rounded-none border-2 border-border bg-background p-1 font-mono"
	>
		<DropdownMenu.Item
			onclick={() => store.links.toggleFavorite(link.id)}
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase hover:bg-muted"
		>
			<Star
				class={cn(
					'h-3.5 w-3.5',
					link.isFavorite ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground'
				)}
			/>
			<span>{link.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
			<DropdownMenu.Shortcut class="text-[9px] opacity-50">f</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
		<DropdownMenu.Item
			onclick={() => onedit(link)}
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase hover:bg-muted"
		>
			<Pencil class="h-3.5 w-3.5 text-primary" />
			<span>Edit Link</span>
			<DropdownMenu.Shortcut class="text-[9px] opacity-50">e</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
		<DropdownMenu.Separator class="bg-border" />
		<DropdownMenu.Item
			onclick={() => {
				if (link.isDeleted) {
					isDeleteDialogOpen = true;
				} else {
					store.links.toggleDeleted(link.id);
				}
			}}
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-destructive uppercase hover:bg-destructive/10"
		>
			<Trash2 class="h-3.5 w-3.5" />
			<span>{link.isDeleted ? 'Delete Permanently' : 'Move to Trash'}</span>
			<DropdownMenu.Shortcut class="text-[9px] opacity-50">d</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
{/snippet}

{#if viewMode === 'list'}
	<div
		class={cn(
			'group flex flex-col border-b border-border/30',
			'transition-colors hover:bg-muted/30'
		)}
	>
		<div class="flex min-h-[28px] items-center gap-2 px-2 py-0.5">
			<!-- Selection indicator -->
			<span class="w-3 shrink-0 text-[10px] text-primary opacity-0 group-hover:opacity-100">
				{TUI.arrowRight}
			</span>

			<!-- Compact Line -->
			<div
				class="grid min-w-0 flex-1 grid-cols-[20px_1fr_200px_150px_40px] items-center gap-2 font-mono text-[12px]"
			>
				<button
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleFavorite(link.id);
					}}
					class={cn(
						'flex shrink-0 justify-center transition-transform hover:scale-125',
						link.isFavorite ? 'text-chart-3' : 'text-muted-foreground/30 hover:text-chart-3'
					)}
				>
					{TUI.bullet}
				</button>

				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="truncate pr-4 font-bold text-foreground hover:text-primary"
				>
					{link.title || link.url}
				</a>

				<span class="truncate text-[11px] text-primary">
					{getDomain(link.url)}
				</span>

				<div class="hidden gap-2 truncate text-[10px] text-chart-3 sm:flex">
					{#each link.tags.slice(0, 2) as tag}
						<span>#{tag}</span>
					{/each}
					{#if link.tags.length > 2}
						<span class="text-muted-foreground">+{link.tags.length - 2}</span>
					{/if}
				</div>

				<span class="text-right text-[10px] text-muted-foreground">
					{formatRelativeTime(link.createdAt)}
				</span>
			</div>

			<!-- Actions Dropdown -->
			<div class="ml-4 shrink-0">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="ghost"
							size="icon"
							class="h-7 w-7 rounded-none border border-transparent hover:border-border "
						>
							<Ellipsis class="h-4 w-4 text-muted-foreground/60" />
						</Button>
					</DropdownMenu.Trigger>
					{@render ActionMenuContent()}
				</DropdownMenu.Root>
			</div>
		</div>
	</div>
{:else}
	<!-- Grid / Card View -->
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
					onclick={() => store.links.toggleFavorite(link.id)}
					class={cn(
						'text-[10px]',
						link.isFavorite ? 'text-chart-3' : 'text-muted-foreground/30 hover:text-chart-3'
					)}
				>
					{TUI.bullet}
				</button>
				<span class="truncate font-mono text-[10px] text-primary">{getDomain(link.url)}</span>
			</div>
			<span class="text-[9px] text-muted-foreground">{formatRelativeTime(link.createdAt)}</span>
		</div>

		<!-- Image / Content -->
		<div class="relative aspect-video w-full overflow-hidden bg-muted/10">
			{#if link.image}
				<img src={link.image} alt={link.title} class="h-full w-full object-cover" />
			{:else}
				<div class="flex h-full w-full items-center justify-center text-muted-foreground/20">
					<span class="font-mono text-4xl">{TUI.bullet}</span>
				</div>
			{/if}

			<!-- Selection indicator overlay -->
			<div
				class="pointer-events-none absolute inset-0 border-2 border-primary opacity-0 transition-opacity group-hover:opacity-100"
			></div>
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
				<TagInput selected={link.tags} onchange={updateTags} />
			</div>

			<!-- Hover Actions for Card -->
			<div
				class="mt-2 flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100"
			>
				<Button
					variant="ghost"
					size="sm"
					class={cn(
						'h-auto p-0 text-[10px] font-bold uppercase transition-none hover:bg-transparent hover:underline',
						link.isFavorite ? 'text-chart-3' : 'text-primary'
					)}
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleFavorite(link.id);
					}}
				>
					[f]av
				</Button>
				<Button
					variant="ghost"
					size="sm"
					class="h-auto p-0 text-[10px] font-bold text-primary uppercase transition-none hover:bg-transparent hover:underline"
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
					class="h-auto p-0 text-[10px] font-bold text-destructive uppercase transition-none hover:bg-transparent hover:underline"
					onclick={(e) => {
						e.preventDefault();
						store.links.toggleDeleted(link.id);
					}}
				>
					[d]el
				</Button>
			</div>
		</div>
	</div>
{/if}

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-[400px] overflow-hidden rounded-none border-2 border-border bg-background p-0 shadow-2xl"
	>
		<div class="flex flex-col font-mono text-foreground">
			<div class="flex h-11 items-center justify-between border-b border-border px-4">
				<h2 class="text-[13px] font-bold tracking-tight text-destructive uppercase">
					Confirm Delete
				</h2>
			</div>

			<div class="space-y-3 px-4 py-4">
				<p class="text-[12px] leading-relaxed text-muted-foreground">
					Permanently remove this link from local database?
				</p>
				<div class="border border-border bg-muted/20 px-3 py-2">
					<span class="text-[12px] font-bold text-foreground">
						{link.title || link.url}
					</span>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
				<Button
					variant="ghost"
					onclick={() => (isDeleteDialogOpen = false)}
					class="h-8 rounded-none border border-border px-3 text-[11px] font-bold uppercase hover:bg-muted"
				>
					Cancel
				</Button>
				<Button
					onclick={handlePermanentDelete}
					class="h-8 rounded-none border border-destructive bg-destructive px-4 text-[11px] font-bold text-destructive-foreground uppercase shadow-sm hover:bg-destructive/90"
				>
					Delete
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

