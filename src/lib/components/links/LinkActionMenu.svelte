<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Link } from '$lib/types';
	import { cn } from '$lib/utils';
	import { RotateCcw, Star, Pencil, Trash2 } from '@lucide/svelte';

	interface Props {
		link: Link;
		onToggleFavorite: (id: string) => void;
		onToggleDeleted: (id: string) => void;
		onedit: (link: Link) => void;
		onDeleteRequest: () => void;
	}

	let { link, onToggleFavorite, onToggleDeleted, onedit, onDeleteRequest }: Props = $props();
</script>

<DropdownMenu.Content
	align="end"
	class="min-w-35 rounded-none border-2 border-border bg-background p-1 font-mono"
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
				onDeleteRequest();
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
