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
	let workspaceToRename = $state<{ id: string; name: string } | null>(null);
	let isRenameDialogOpen = $state(false);
	let renameValue = $state('');
	let isRenaming = $state(false);
	let renameError = $state('');
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

	function requestRenameWorkspace(id: string, name: string) {
		workspaceToRename = { id, name };
		renameValue = name;
		renameError = '';
		isRenameDialogOpen = true;
	}

	async function confirmRenameWorkspace() {
		if (!workspaceToRename || !renameValue.trim()) return;

		isRenaming = true;
		renameError = '';
		try {
			const result = await store.workspaces.rename(
				workspaceToRename.id as WorkspaceId,
				renameValue.trim()
			);
			if (result.ok) {
				isRenameDialogOpen = false;
				workspaceToRename = null;
			} else {
				renameError = result.error.message;
			}
		} catch (e) {
			renameError = 'Failed to rename workspace';
		} finally {
			isRenaming = false;
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
					<button
						class="px-1 text-[10px] font-bold text-primary uppercase hover:bg-primary/20"
						onclick={() => requestRenameWorkspace(ws.id, ws.name)}
					>
						[r]ename
					</button>

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
		class="max-w-96 overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 font-mono shadow-2xl"
	>
		<div class="flex flex-col">
			<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-bold tracking-tight text-destructive uppercase">
						Delete Workspace
					</span>
				</div>
				<div class="flex items-center gap-3 text-xs">
					<div class="flex items-center gap-1 text-muted-foreground">
						<span
							class="border border-border bg-muted px-1 py-0 text-xs font-bold text-foreground uppercase"
							>esc</span
						>
						<span>close</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (isDeleteDialogOpen = false)}
						class="h-7 w-7 rounded-none border border-transparent hover:border-border hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div class="space-y-4 p-6">
				<p class="text-[12px] leading-relaxed text-muted-foreground">
					Are you sure you want to delete <span class="font-bold text-foreground"
						>[{workspaceToDelete?.name}]</span
					>?
				</p>
				<div class="border border-border bg-muted/20 px-3 py-2">
					<p class="text-[11px] leading-tight text-muted-foreground italic">
						{TUI.bullet} This action is irreversible. All links associated with this workspace will be
						permanently removed from the local database.
					</p>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
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
					class="h-8 rounded-none border border-destructive bg-destructive px-4 text-[11px] font-bold text-destructive-foreground uppercase shadow-sm active:scale-95"
				>
					Confirm Delete
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isRenameDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-96 overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 font-mono shadow-2xl"
	>
		<div class="flex flex-col">
			<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-bold tracking-tight text-foreground uppercase">
						Rename Workspace
					</span>
				</div>
				<div class="flex items-center gap-3 text-xs">
					<div class="flex items-center gap-1 text-muted-foreground">
						<span
							class="border border-border bg-muted px-1 py-0 text-xs font-bold text-foreground uppercase"
							>esc</span
						>
						<span>close</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (isRenameDialogOpen = false)}
						class="h-7 w-7 rounded-none border border-transparent hover:border-border hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div class="space-y-4 p-6">
				<div class="space-y-2">
					<label for="rename-input" class="text-[11px] font-bold text-muted-foreground uppercase">
						New Name
					</label>
					<Input
						id="rename-input"
						bind:value={renameValue}
						placeholder="Workspace name..."
						class="h-8 rounded-none border-border/20 bg-muted/20 font-mono text-[13px] transition-all focus-visible:ring-primary"
						onkeydown={(e) => e.key === 'Enter' && confirmRenameWorkspace()}
					/>
					{#if renameError}
						<p class="text-[11px] font-medium text-destructive">{renameError}</p>
					{/if}
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
				<Button
					variant="ghost"
					onclick={() => (isRenameDialogOpen = false)}
					class="h-8 rounded-none border border-border bg-background px-4 text-[11px] font-bold uppercase transition-colors hover:bg-muted"
				>
					Cancel
				</Button>
				<Button
					variant="default"
					onclick={confirmRenameWorkspace}
					disabled={isRenaming || !renameValue.trim() || renameValue === workspaceToRename?.name}
					class="h-8 rounded-none border border-primary bg-primary px-4 text-[11px] font-bold text-primary-foreground uppercase shadow-sm active:scale-95"
				>
					{#if isRenaming}
						<Loader class="mr-2 h-3 w-3 animate-spin" />
					{/if}
					Save Changes
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
