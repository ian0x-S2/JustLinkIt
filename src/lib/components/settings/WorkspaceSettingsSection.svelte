<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Layers, Plus, X, Loader } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { WorkspaceId } from '$lib/types';
	import { cn } from '$lib/utils';
	import { theme, TUI } from '$lib/tui';

	const store = getContext<AppStore>('store');

	const sortedWorkspaces = $derived(
		[...store.workspaces.workspaces].sort((a, b) => {
			if (a.id === store.workspaces.activeId) return -1;
			if (b.id === store.workspaces.activeId) return 1;
			return 0;
		})
	);

	let workspaceToDelete = $state<{ id: string; name: string } | null>(null);
	let isDeleteDialogOpen = $state(false);
	let newWorkspaceName = $state('');
	let isAddingWorkspace = $state(false);
	let addError = $state('');

	async function handleAddWorkspace(e?: SubmitEvent | KeyboardEvent) {
		if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
		if (e instanceof SubmitEvent) e.preventDefault();

		const name = newWorkspaceName.trim();
		if (!name) return;

		isAddingWorkspace = true;
		addError = '';
		try {
			const result = await store.workspaces.add(name);
			if (result.ok) {
				newWorkspaceName = '';
			} else {
				addError = result.error.message;
			}
		} catch (e) {
			addError = 'Failed to create workspace';
		} finally {
			isAddingWorkspace = false;
		}
	}

	function requestDeleteWorkspace(id: string, name: string) {
		if (store.workspaces.count <= 1) return;
		workspaceToDelete = { id, name };
		isDeleteDialogOpen = true;
	}

	async function confirmDeleteWorkspace() {
		if (!workspaceToDelete) return;

		try {
			const id = workspaceToDelete.id;
			const wasActive = id === store.workspaces.activeId;
			await store.workspaces.remove(id as WorkspaceId);
			if (wasActive) {
				await store.setActiveWorkspace(store.workspaces.activeId);
			}
			isDeleteDialogOpen = false;
			workspaceToDelete = null;
		} catch (e) {
			console.error('Failed to delete workspace:', e);
		}
	}

	const workspaceStats = $derived.by(() => {
		const stats: Record<string, number> = {};
		store.workspaces.workspaces.forEach((ws) => {
			if (ws.id === store.workspaces.activeId) {
				stats[ws.id] = store.links.links.filter((l) => !l.isDeleted).length;
			} else {
				stats[ws.id] = ws.linkCount || 0;
			}
		});
		return stats;
	});
</script>

<section class="space-y-4">
	<div>
		<h2 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Workspaces</h2>
	</div>

	<div class="group relative">
		<div
			class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
		>
			{#if isAddingWorkspace}
				<Loader class="h-3.5 w-3.5 animate-spin" />
			{:else}
				<Plus class="h-3.5 w-3.5" />
			{/if}
		</div>
		<Input
			bind:value={newWorkspaceName}
			onkeydown={handleAddWorkspace}
			placeholder="Create new workspace..."
			class="h-8 rounded-none border-border/20 bg-muted/20 pl-9 font-mono text-[13px] transition-all  "
		/>
		{#if newWorkspaceName.trim() && !isAddingWorkspace}
			<button
				onclick={() => handleAddWorkspace()}
				class="absolute top-1/2 right-1 h-6 -translate-y-1/2 rounded-none bg-primary px-2 text-[10px] font-bold text-primary-foreground uppercase transition-all hover:bg-primary/90 active:scale-95"
			>
				Create
			</button>
		{/if}
	</div>
	{#if addError}
		<p class="mt-1 px-1 text-[11px] font-medium text-destructive">{addError}</p>
	{/if}

	<div class="grid gap-1">
		{#each sortedWorkspaces as ws (ws.id)}
			<div
				class={cn(
					theme.item,
					'group px-2 py-1',
					ws.id === store.workspaces.activeId ? 'bg-primary/10' : 'hover:bg-muted/50'
				)}
			>
				<div class="flex min-w-0 flex-1 items-center gap-2">
					<Layers
						class={cn(
							'h-3.5 w-3.5 shrink-0',
							ws.id === store.workspaces.activeId ? 'text-primary' : 'text-muted-foreground'
						)}
					/>
					<span
						class={cn(
							'truncate font-bold',
							ws.id === store.workspaces.activeId ? 'text-primary' : ''
						)}
					>
						{ws.name}
					</span>
					{#if ws.id === store.workspaces.activeId}
						<span class="text-[10px] font-bold text-primary uppercase">[active]</span>
					{/if}
					<span class="ml-auto text-[11px] whitespace-nowrap text-muted-foreground">
						{workspaceStats[ws.id] || 0}
						{(workspaceStats[ws.id] || 0) === 1 ? 'link' : 'links'}
					</span>
				</div>

				<div class="flex items-center gap-1">
					{#if ws.id !== store.workspaces.activeId}
						<button
							class="px-1 text-[10px] font-bold text-primary uppercase hover:bg-primary/20"
							onclick={() => store.setActiveWorkspace(ws.id)}
						>
							[s]witch
						</button>
					{/if}

					{#if store.workspaces.count > 1}
						<button
							class="px-1 text-[10px] font-bold text-destructive uppercase hover:bg-destructive/20"
							onclick={() => requestDeleteWorkspace(ws.id, ws.name)}
						>
							[d]elete
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-md overflow-hidden rounded-none border-2 border-border bg-background p-0 font-mono shadow-2xl"
	>
		<div class="flex flex-col">
			<div class="flex h-9 items-center justify-between border-b border-border bg-destructive px-3">
				<div class="flex items-center gap-2">
					<span class="text-[11px] font-bold tracking-tight text-destructive-foreground uppercase">
						Delete Workspace
					</span>
				</div>
				<div class="flex items-center gap-4 text-[9px]">
					<div class="flex items-center gap-1 text-destructive-foreground/70">
						<span
							class="border border-destructive-foreground/30 bg-destructive-foreground/10 px-1 py-0.5 text-[7px] font-bold text-destructive-foreground uppercase"
							>esc</span
						>
						<span>close</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (isDeleteDialogOpen = false)}
						class="h-6 w-6 rounded-none border border-transparent text-destructive-foreground hover:bg-white/20"
					>
						<X class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			<div class="space-y-4 p-6">
				<p class="text-[13px] leading-relaxed text-foreground">
					Are you sure you want to delete <span class="font-bold text-destructive"
						>[{workspaceToDelete?.name}]</span
					>?
				</p>
				<div class="border border-destructive/20 bg-destructive/5 p-3">
					<p class="text-[11px] leading-tight text-muted-foreground italic">
						{TUI.bullet} This action is irreversible. All links associated with this workspace will be
						permanently removed from the local database.
					</p>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
				<Button
					variant="ghost"
					onclick={() => (isDeleteDialogOpen = false)}
					class="h-8 rounded-none border border-border bg-background px-4 text-[11px] font-bold uppercase transition-colors hover:bg-muted"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onclick={confirmDeleteWorkspace}
					class="h-8 rounded-none px-4 text-[11px] font-bold uppercase shadow-sm active:scale-95"
				>
					Confirm Delete
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
