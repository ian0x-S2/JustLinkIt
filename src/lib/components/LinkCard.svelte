<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils.js';
	import { TUI, formatRelativeTime } from '$lib/tui';
	import TagInput from '$lib/components/TagInput.svelte';
	import { Ellipsis, Star, Pencil, Trash2, RotateCcw, Globe } from '@lucide/svelte';

	interface Props {
		link: Link;
		viewMode?: 'list' | 'grid';
		onedit: (link: Link) => void;
		onToggleFavorite: (id: string) => void;
		onToggleDeleted: (id: string) => void;
		onPermanentDelete: (id: string) => void;
		onUpdateTags: (id: string, tags: string[]) => void;
	}

	let {
		link,
		viewMode = 'list',
		onedit,
		onToggleFavorite,
		onToggleDeleted,
		onPermanentDelete,
		onUpdateTags
	}: Props = $props();

	let isDeleteDialogOpen = $state(false);
	let logoError = $state(false);
	let logoLoaded = $state(false);
	let imageError = $state(false);

	$effect(() => {
		// Reset error states when link changes
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

	function handlePermanentDelete() {
		onPermanentDelete(link.id);
		isDeleteDialogOpen = false;
	}
</script>

{#snippet ActionMenuContent()}
	<DropdownMenu.Content
		align="end"
		class="min-w-[140px] rounded-none border-2 border-border bg-background p-1 font-mono"
	>
		{#if link.isDeleted}
			<DropdownMenu.Item
				onclick={() => onToggleDeleted(link.id)}
				class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase data-highlighted:bg-muted data-highlighted:text-primary"
			>
				<RotateCcw class="h-3.5 w-3.5 text-primary" />
				<span>Restore</span>
				<DropdownMenu.Shortcut class="text-[9px] opacity-50">r</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		{/if}
		<DropdownMenu.Item
			onclick={() => onToggleFavorite(link.id)}
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase data-highlighted:bg-muted data-highlighted:text-primary"
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
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold uppercase data-highlighted:bg-muted data-highlighted:text-primary"
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
					onToggleDeleted(link.id);
				}
			}}
			class="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-destructive uppercase data-highlighted:bg-muted data-highlighted:text-destructive"
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
		<div class="flex min-h-[44px] items-center gap-2 px-3 py-2">
			<!-- Selection indicator -->
			<span class="w-3 shrink-0 text-[10px] text-primary opacity-0 group-hover:opacity-100">
				{TUI.arrowRight}
			</span>

			<!-- Compact Line -->
			<div
				class="grid min-w-0 flex-1 grid-cols-[20px_1fr_auto] items-center gap-2 font-mono text-[12px] lg:grid-cols-[20px_1fr_200px_150px_40px]"
			>
				<button
					class={cn(
						'flex h-4 w-4 shrink-0 items-center justify-center transition-transform hover:scale-110'
					)}
				>
					{#if link.logo && !logoError}
						<div class="relative flex h-3.5 w-3.5 items-center justify-center">
							{#if !logoLoaded}
								<Globe class="absolute inset-0 h-3.5 w-3.5 text-muted-foreground/50 opacity-50" />
							{/if}
							<img
								src={link.logo}
								alt=""
								class={cn(
									'h-3.5 w-3.5 object-contain transition-opacity duration-200',
									logoLoaded ? 'opacity-100' : 'opacity-0'
								)}
								onerror={() => (logoError = true)}
								onload={() => (logoLoaded = true)}
							/>
						</div>
					{:else}
						<Globe class="h-3.5 w-3.5 text-muted-foreground/50" />
					{/if}
				</button>

				<div class="flex min-w-0 flex-col lg:contents">
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="truncate pr-4 font-bold text-foreground hover:text-primary"
					>
						{link.title || link.url}
					</a>

					<span class="truncate text-[10px] text-primary lg:text-[11px]">
						{getDomain(link.url)}
					</span>
				</div>

				<div class="hidden gap-2 truncate text-[10px] text-chart-3 lg:flex">
					{#each link.tags.slice(0, 2) as tag (tag)}
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
			<div class="ml-4 flex shrink-0 items-center gap-1">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="ghost"
								size="icon"
								class="h-7 w-7 rounded-none hover:bg-muted dark:hover:bg-muted "
							>
								<Ellipsis class="h-4 w-4 text-muted-foreground/60" />
							</Button>
						{/snippet}
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
							isDeleteDialogOpen = true;
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
