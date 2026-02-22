<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { X } from '@lucide/svelte';
	import type { Link } from '$lib/types';

	interface Props {
		open: boolean;
		link: Link;
		onConfirm: () => void;
		onClose: () => void;
	}

	let { open = $bindable(), link, onConfirm, onClose }: Props = $props();

	function handlePermanentDelete() {
		onConfirm();
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-96 overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 shadow-2xl"
	>
		<div class="flex flex-col font-mono text-foreground">
			<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
				<div class="flex items-center gap-2">
					<h2 class="text-xs font-bold tracking-tight text-destructive uppercase">
						Confirm Delete
					</h2>
				</div>
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1 text-muted-foreground">
						<span class="border border-border bg-muted px-1 py-0 text-xs font-bold text-foreground uppercase"
							>esc</span
						>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={onClose}
						class="h-7 w-7 rounded-none border border-transparent hover:border-border hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div class="space-y-4 p-6">
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
					onclick={onClose}
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
