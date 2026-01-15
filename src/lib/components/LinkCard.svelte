<script lang="ts">
	import type { Link } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { 
		Edit2, 
		Trash2, 
		MoreHorizontal,
		FileText,
		ExternalLink
	} from '@lucide/svelte';
	import { formatDistanceToNow } from 'date-fns';
	import * as Popover from '$lib/components/ui/popover';

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

<div class="group relative flex flex-col h-full bg-background border rounded-md shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
	<!-- Top: Preview Image -->
	<div class="relative aspect-video w-full bg-muted/20 border-b overflow-hidden">
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
			<span class="px-1.5 py-0.5 rounded-[4px] bg-background/80 backdrop-blur-sm border text-[10px] font-medium text-foreground shadow-sm">
				{getDomain(link.url)}
			</span>
		</div>
	</div>

	<!-- Middle: Content -->
	<div class="flex flex-col flex-1 p-3.5 gap-2">
		<div class="flex flex-col gap-1">
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-[14px] font-semibold leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
			>
				{link.title || link.url}
			</a>
			{#if link.description}
				<p class="text-[12px] text-muted-foreground/70 line-clamp-2 leading-normal">
					{link.description}
				</p>
			{/if}
		</div>

		<!-- Tags -->
		<div class="mt-auto pt-2 flex flex-wrap gap-1">
			{#each link.tags.slice(0, 3) as tag}
				<Badge variant="secondary" class="h-4.5 px-1.5 text-[9px] font-medium rounded-[3px] bg-muted/50 text-muted-foreground border-transparent">
					{tag}
				</Badge>
			{/each}
			{#if link.tags.length > 3}
				<span class="text-[9px] text-muted-foreground/50 self-center">+{link.tags.length - 3}</span>
			{/if}
		</div>
	</div>

	<!-- Bottom: Actions & Meta -->
	<div class="px-3.5 py-2.5 border-t bg-muted/[0.02] flex items-center justify-between">
		<span class="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-tight">
			{formatDistanceToNow(link.createdAt, { addSuffix: true })}
		</span>

		<div class="flex items-center gap-1">
			<Button 
				variant="ghost" 
				size="icon" 
				class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
				onclick={() => window.open(link.url, '_blank')}
			>
				<ExternalLink class="h-3.5 w-3.5" />
			</Button>

			<Popover.Root bind:open={actionsOpen}>
				<Popover.Trigger asChild>
					{#snippet children(props)}
						<Button 
							variant="ghost" 
							size="icon" 
							class="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
							{...props}
						>
							<MoreHorizontal class="h-3.5 w-3.5" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content align="end" class="w-40 p-1 rounded-md shadow-lg border">
					<div class="flex flex-col gap-0.5">
						<Button 
							variant="ghost" 
							size="sm" 
							class="justify-start h-8 px-2 text-[12px] font-medium rounded-md"
							onclick={() => { onedit(link); actionsOpen = false; }}
						>
							<Edit2 class="mr-2 h-3 w-3" />
							<span>Edit</span>
						</Button>
						<div class="h-[1px] bg-border my-1"></div>
						<Button 
							variant="ghost" 
							size="sm" 
							class="justify-start h-8 px-2 text-[12px] font-medium text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
							onclick={() => { ondelete(link.id); actionsOpen = false; }}
						>
							<Trash2 class="mr-2 h-3 w-3" />
							<span>Delete</span>
						</Button>
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>
</div>