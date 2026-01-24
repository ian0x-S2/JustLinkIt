<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft, Trash2, Layers, Plus } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { LinkStore } from '$lib/store.svelte';

	import * as Dialog from '$lib/components/ui/dialog/index.js';

	const store = getContext<LinkStore>('store');

	let workspaceToDelete = $state<{ id: string; name: string } | null>(null);
	let isDeleteDialogOpen = $state(false);

	function requestDeleteWorkspace(id: string, name: string) {
		if (store.workspaces.length <= 1) return;
		workspaceToDelete = { id, name };
		isDeleteDialogOpen = true;
	}

	async function confirmDeleteWorkspace() {
		if (!workspaceToDelete) return;
		
		try {
			const id = workspaceToDelete.id;
			const wasActive = store.activeWorkspaceId === id;
			await store.removeWorkspace(id);
			if (wasActive && store.workspaces.length > 0) {
				await store.setActiveWorkspace(store.workspaces[0].id);
			}
			isDeleteDialogOpen = false;
			workspaceToDelete = null;
		} catch (e) {
			console.error('Failed to delete workspace:', e);
		}
	}
</script>

<div class="flex flex-col h-screen bg-background text-foreground">
	<!-- Header Section -->
	<div class="flex h-12 shrink-0 items-center border-b bg-background/80 px-4 backdrop-blur-md">
		<Button variant="ghost" size="icon" href="/" class="mr-2 h-7 w-7 rounded-md">
			<ArrowLeft class="h-3.5 w-3.5" />
		</Button>
		<h1 class="text-[13px] font-semibold tracking-tight">Settings</h1>
	</div>

	<div class="flex-1 overflow-y-auto">
		<div class="mx-auto max-w-2xl space-y-8 p-6">
			<!-- Section: Workspaces -->
			<section class="space-y-4">
				<div class="flex items-center justify-between px-1">
					<div class="space-y-1">
						<h3 class="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">Management</h3>
						<h2 class="text-lg font-semibold tracking-tight">Workspaces</h2>
					</div>
				</div>

				<div class="grid gap-3">
					{#each store.workspaces as ws (ws.id)}
						<div class="group flex items-center justify-between rounded-md border bg-muted/20 p-3 transition-colors hover:bg-muted/30">
							<div class="flex items-center gap-3">
								<div class="flex h-8 w-8 items-center justify-center rounded-md border bg-background shadow-sm">
									<Layers class="h-4 w-4 text-muted-foreground" />
								</div>
								<div class="space-y-0.5">
									<div class="flex items-center gap-2">
										<p class="text-[13px] font-medium leading-none">{ws.name}</p>
										{#if ws.id === store.activeWorkspaceId}
											<Badge variant="secondary" class="h-4 px-1.5 text-[9px] font-bold uppercase">Active</Badge>
										{/if}
									</div>
									<p class="text-[11px] text-muted-foreground">{ws.linkCount || 0} links</p>
								</div>
							</div>
							
							<div class="flex items-center gap-2">
								{#if store.workspaces.length > 1}
									<Button 
										variant="ghost" 
										size="icon" 
										class="h-8 w-8 rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
										onclick={() => requestDeleteWorkspace(ws.id, ws.name)}
									>
										<Trash2 class="h-3.5 w-3.5" />
									</Button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Section: System Info -->
			<section class="space-y-3 px-1">
				<h3 class="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">System</h3>
				<div class="flex items-center justify-between py-1">
					<div class="space-y-0.5">
						<p class="text-[12.5px] font-medium">Data Persistence</p>
						<p class="text-[11px] text-muted-foreground/60">SQLite (Local Server)</p>
					</div>
					<Badge
						variant="outline"
						class="h-4.5 rounded-lg px-1.5 text-[9px] font-bold tracking-tighter uppercase border-green-500/50 text-green-600 dark:text-green-400"
						>Connected</Badge
					>
				</div>
			</section>

			<!-- Footer Actions -->
			<div class="flex justify-end gap-2 pt-6 border-t">
				<Button variant="ghost" href="/" class="h-8 rounded-md px-4 text-[12.5px]">Back to Dashboard</Button>
			</div>
		</div>
	</div>
</div>

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content class="max-w-100">
		<Dialog.Header>
			<Dialog.Title>Delete Workspace</Dialog.Title>
			<Dialog.Description class="text-[13px]">
				Are you sure you want to delete <span class="font-semibold text-foreground">"{workspaceToDelete?.name}"</span>? 
				This action cannot be undone and all links within this workspace will be permanently removed.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4 gap-2">
			<Button variant="ghost" size="sm" class="h-8 text-[12px]" onclick={() => (isDeleteDialogOpen = false)}>
				Cancel
			</Button>
			<Button variant="destructive" size="sm" class="h-8 text-[12px]" onclick={confirmDeleteWorkspace}>
				Delete Workspace
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
