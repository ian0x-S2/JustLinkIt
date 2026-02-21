<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils.js';
	import { TUI, formatRelativeTime } from '$lib/tui';
	import { Ellipsis, Globe } from '@lucide/svelte';
	import LinkActionMenu from './LinkActionMenu.svelte';
	import { getDomain } from '$lib/utils/url';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		onToggleFavorite: (id: string) => void;
		onToggleDeleted: (id: string) => void;
		onDeleteRequest: () => void;
	}

	let { link, onedit, onToggleFavorite, onToggleDeleted, onDeleteRequest }: Props = $props();

	let logoError = $state(false);
	let logoLoaded = $state(false);

	$effect(() => {
		void link.id;
		logoError = false;
		logoLoaded = false;
	});
</script>

<div
	class={cn('group flex flex-col border-b border-border/30', 'transition-colors hover:bg-muted/30')}
>
	<div class="flex h-10 items-center gap-2 px-2 py-1">
		<!-- Selection indicator -->
		<span class="w-3 shrink-0 text-xs text-primary opacity-0 group-hover:opacity-100">
			{TUI.arrowRight}
		</span>

		<!-- Compact Line -->
		<div
			class="grid min-w-0 flex-1 grid-cols-[20px_1fr_auto] items-center gap-2 font-mono text-sm lg:grid-cols-[20px_1fr_180px_120px_40px]"
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

				<span class="truncate text-xs text-primary lg:text-sm">
					{getDomain(link.url)}
				</span>
			</div>

			<div class="hidden gap-2 truncate text-xs text-chart-3 lg:flex">
				{#each link.tags.slice(0, 2) as tag (tag)}
					<span>#{tag}</span>
				{/each}
				{#if link.tags.length > 2}
					<span class="text-muted-foreground">+{link.tags.length - 2}</span>
				{/if}
			</div>

			<span class="text-right text-xs text-muted-foreground">
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
				<LinkActionMenu {link} {onedit} {onToggleFavorite} {onToggleDeleted} {onDeleteRequest} />
			</DropdownMenu.Root>
		</div>
	</div>
</div>
