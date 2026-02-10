<script lang="ts">
	import type { Link } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as Dialog from '$lib/components/ui/dialog';
	import { cn } from '$lib/utils.js';
	import { TUI, formatRelativeTime } from '$lib/tui';

		interface Props {

			link: Link;

			viewMode?: 'list' | 'grid';

			onedit: (link: Link) => void;

			ondelete: (id: string) => void;

		}

	

		let { link, viewMode = 'list', onedit, ondelete }: Props = $props();

		const store = getContext<AppStore>('store');

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

	

	{#if viewMode === 'list'}

		<div

			class={cn(

				'group flex flex-col border-b border-border/30',

				'hover:bg-muted/30 transition-colors'

			)}

		>

			<div class="flex gap-2 px-2 py-0.5 items-center min-h-[28px]">

				<!-- Selection indicator -->

				<span class="w-3 shrink-0 text-[10px] text-primary opacity-0 group-hover:opacity-100">

					{TUI.arrowRight}

				</span>

	

				<!-- Compact Line: Favorite? | Title | Domain | Time (Grid for alignment) -->

				<div

					class="grid grid-cols-[20px_1fr_200px_150px_40px] gap-2 flex-1 min-w-0 font-mono text-[12px] items-center"

				>

					<button

						onclick={(e) => {

							e.preventDefault();

							store.links.toggleFavorite(link.id);

						}}

						class={cn(

							'shrink-0 flex justify-center hover:scale-125 transition-transform',

							link.isFavorite ? 'text-chart-3' : 'text-muted-foreground/30 hover:text-chart-3'

						)}

					>

						{TUI.bullet}

					</button>

	

					<a

						href={link.url}

						target="_blank"

						rel="noopener noreferrer"

						class="truncate font-bold text-foreground hover:text-primary pr-4"

					>

						{link.title || link.url}

					</a>

	

					<span class="text-primary truncate text-[11px]">

						{getDomain(link.url)}

					</span>

	

					<div class="hidden sm:flex gap-2 text-[10px] text-chart-3 truncate">

						{#each link.tags.slice(0, 2) as tag}

							<span>#{tag}</span>

						{/each}

						{#if link.tags.length > 2}

							<span class="text-muted-foreground">+{link.tags.length - 2}</span>

						{/if}

					</div>

	

					<span class="text-muted-foreground text-[10px] text-right">

						{formatRelativeTime(link.createdAt)}

					</span>

				</div>

	

				<!-- Actions -->

				<div

					class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0"

				>

					<button

						class={cn('text-[10px] hover:underline', link.isFavorite ? 'text-chart-3' : 'text-primary')}

						onclick={(e) => {

							e.preventDefault();

							store.links.toggleFavorite(link.id);

						}}

					>

						[f]av

					</button>

					<button

						class="text-[10px] text-primary hover:underline"

						onclick={(e) => {

							e.preventDefault();

							onedit(link);

						}}

					>

						[e]dit

					</button>

					<button

						class="text-[10px] text-destructive hover:underline"

						onclick={(e) => {

							e.preventDefault();

							if (link.isDeleted) {

								isDeleteDialogOpen = true;

							} else {

								store.links.toggleDeleted(link.id);

							}

						}}

					>

						[d]el

					</button>

				</div>

			</div>

		</div>

	{:else}

		<!-- Grid / Card View -->

		<div

			class={cn(

				'group flex flex-col border border-border/50 bg-card/5',

				'hover:border-primary/50 transition-all duration-200'

			)}

		>

			<!-- TUI Header for Card -->

			<div class="flex h-6 items-center border-b border-border/50 bg-muted/20 px-2 justify-between">

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

					<span class="text-[10px] font-mono text-primary truncate">{getDomain(link.url)}</span>

				</div>

				<span class="text-[9px] text-muted-foreground">{formatRelativeTime(link.createdAt)}</span>

			</div>

	

			<!-- Image / Content -->

			<div class="relative aspect-video w-full overflow-hidden bg-muted/10">

																{#if link.image}

																	<img

																		src={link.image}

																		alt={link.title}

																		class="h-full w-full object-cover"

																	/>

																{:else}

					<div class="flex h-full w-full items-center justify-center text-muted-foreground/20">

						<span class="text-4xl font-mono">{TUI.bullet}</span>

					</div>

				{/if}

	

				<!-- Selection indicator overlay -->

				<div

					class="absolute inset-0 border-2 border-primary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"

				></div>

			</div>

	

			<!-- Footer Info -->

			<div class="p-2 flex flex-col gap-1">

				<a

					href={link.url}

					target="_blank"

					rel="noopener noreferrer"

					class="text-[12px] font-bold text-foreground line-clamp-1 hover:text-primary transition-colors"

				>

					{link.title || link.url}

				</a>

				{#if link.tags.length > 0}

					<div class="flex flex-wrap gap-1.5 mt-0.5">

						{#each link.tags.slice(0, 3) as tag}

							<span class="text-[9px] text-chart-3">#{tag}</span>

						{/each}

					</div>

				{/if}

	

				<!-- Hover Actions for Card -->

				<div class="mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">

					<button

						class="text-[10px] text-primary hover:underline"

						onclick={(e) => {

							e.preventDefault();

							onedit(link);

						}}

					>

						[e]dit

					</button>

					<button

						class="text-[10px] text-destructive hover:underline"

						onclick={(e) => {

							e.preventDefault();

							store.links.toggleDeleted(link.id);

						}}

					>

						[d]el

					</button>

				</div>

			</div>

		</div>

	{/if}

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content showCloseButton={false} class="max-w-[400px] overflow-hidden border-2 border-foreground bg-background p-0 rounded-none">
		<div class="flex flex-col text-foreground font-mono">
			<div class="flex h-11 items-center justify-between border-b border-border px-4">
				<h2 class="text-[13px] font-bold uppercase tracking-tight text-destructive">
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
					class="h-8 px-3 text-[12px] hover:bg-muted/50"
				>
					Cancel
				</Button>
				<Button
					onclick={handlePermanentDelete}
					class="h-8 px-4 text-[12px] bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none"
				>
					Delete
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>