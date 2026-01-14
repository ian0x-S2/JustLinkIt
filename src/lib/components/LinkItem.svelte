<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { 
		ExternalLink, 
		Edit2, 
		Trash2, 
		Sparkles, 
		MoreHorizontal,
		FileText,
		Calendar,
		Plus
	} from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';

	import { aiConfig, updateLink } from '$lib/store.svelte';

	interface Props {
		link: Link;
		onedit: (link: Link) => void;
		ondelete: (id: string) => void;
	}

	let { link, onedit, ondelete }: Props = $props();

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

<div class="group border-b bg-background transition-all hover:bg-muted/30">
	<div class="flex items-center gap-4 px-6 py-3">
		<!-- Favicon/Icon -->
		<div class="shrink-0">
			<div class="flex h-8 w-8 items-center justify-center rounded border bg-background text-muted-foreground shadow-sm">
				{#if link.image && !imageError}
					<img
						src={link.image}
						alt=""
						class="h-full w-full object-cover rounded-[2px]"
						onerror={() => (imageError = true)}
					/>
				{:else}
					<FileText class="h-4 w-4" />
				{/if}
			</div>
		</div>

				<!-- Content -->
				<div class="min-w-0 flex-1 flex items-center gap-4">
					<div class="min-w-0 flex-1 py-0.5">
						<div class="flex flex-col gap-0.5">
							<div class="flex items-center gap-2">
								<a
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									class="text-[14px] font-semibold leading-tight text-foreground hover:text-primary transition-colors truncate"
								>
									{link.title || link.url}
								</a>
								<span class="text-[11px] text-muted-foreground/40 font-normal shrink-0">
									{getDomain(link.url)}
								</span>
							</div>
							{#if link.description}
								<p class="text-[12px] text-muted-foreground/60 line-clamp-1 font-normal leading-normal">
									{link.description}
								</p>
							{/if}
						</div>
					</div>
		
					<div class="hidden md:flex items-center gap-1.5 shrink-0 max-w-[200px] overflow-hidden">				{#each link.tags as tag (tag)}
					<Badge
						variant="secondary"
						class="h-5 px-1.5 text-[10px] font-medium bg-muted/50 text-muted-foreground border-none rounded"
					>
						{tag}
					</Badge>
				{/each}
			</div>

			<div class="hidden sm:block shrink-0 w-24 text-[12px] text-muted-foreground text-right">
				{formatDistanceToNow(link.createdAt, { addSuffix: true })}
			</div>

			<div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
				<Popover.Root bind:open={actionsOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button 
								{...props}
								variant="ghost" 
								size="icon" 
								class="h-7 w-7 text-muted-foreground hover:text-foreground"
							>
								<MoreHorizontal class="h-4 w-4" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content align="end" class="w-40 p-1">
						<div class="flex flex-col gap-1">
							<Button 
								variant="ghost" 
								size="sm" 
								class="justify-start h-8 px-2 text-xs font-normal"
								onclick={() => { onedit(link); actionsOpen = false; }}
							>
								<Edit2 class="mr-2 h-3.5 w-3.5" />
								<span>Edit</span>
							</Button>
							<div class="h-[1px] bg-border my-1"></div>
							<Button 
								variant="ghost" 
								size="sm" 
								class="justify-start h-8 px-2 text-xs font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
								onclick={() => { ondelete(link.id); actionsOpen = false; }}
							>
								<Trash2 class="mr-2 h-3.5 w-3.5" />
								<span>Delete</span>
							</Button>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
	</div>
</div>