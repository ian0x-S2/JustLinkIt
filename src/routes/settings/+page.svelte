<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { ArrowLeft, Trash2, Layers, Plus, Database, Info, Loader2, Check } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { WorkspaceId } from '$lib/types';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	const store = getContext<AppStore>('store');

	let workspaceToDelete = $state<{ id: string; name: string } | null>(null);
	let isDeleteDialogOpen = $state(false);
	let newWorkspaceName = $state('');
	let isAddingWorkspace = $state(false);
	let addError = $state('');

	async function handleAddWorkspace(e: SubmitEvent | KeyboardEvent) {
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
			await store.workspaces.remove(id as WorkspaceId);
			isDeleteDialogOpen = false;
			workspaceToDelete = null;
		} catch (e) {
			console.error('Failed to delete workspace:', e);
		}
	}
</script>

<div class="mx-auto flex h-screen w-full max-w-[1265px]">
	<!-- Left Sidebar -->
	<LeftSidebar onAddLink={() => {}} onExport={() => {}} />

	<!-- Center Content -->
	<main class="flex h-screen w-[600px] flex-col border-x">
		<!-- Header -->
		<div class="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md">
			<Button variant="ghost" size="icon" href="/" class="h-8 w-8 rounded-full hover:bg-muted">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div class="flex flex-col">
				<h1 class="text-[15px] font-bold tracking-tight">Settings</h1>
				<p class="text-[11px] text-muted-foreground leading-none">Manage your workspaces and preferences</p>
			</div>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-hidden">
			<ScrollArea type="hover" class="h-full w-full">
				<div class="flex flex-col p-4 space-y-8">
					
					<!-- Section: Workspaces -->
					<section class="space-y-4">
						<div class="px-1">
							<h3 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
								Management
							</h3>
							<h2 class="text-xl font-extrabold tracking-tight mt-1">Workspaces</h2>
						</div>

						<!-- Add Workspace Input -->
						<div class="px-1">
							<div class="relative group">
								<div class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
									{#if isAddingWorkspace}
										<Loader2 class="h-4 w-4 animate-spin" />
									{:else}
										<Plus class="h-4 w-4" />
									{/if}
								</div>
								<Input
									bind:value={newWorkspaceName}
									onkeydown={handleAddWorkspace}
									placeholder="Create new workspace..."
									class="h-10 pl-10 bg-muted/20 border-border/10 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
								/>
								{#if newWorkspaceName.trim() && !isAddingWorkspace}
									<button 
										onclick={handleAddWorkspace}
										class="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 rounded-md bg-primary text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition-all active:scale-95"
									>
										Create
									</button>
								{/if}
							</div>
							{#if addError}
								<p class="mt-1 text-[11px] font-medium text-destructive px-1">{addError}</p>
							{/if}
						</div>

						<div class="grid gap-2 mt-4">
							{#each store.workspaces.workspaces as ws (ws.id)}
								<div
									class="group relative flex items-center justify-between rounded-xl border border-border/10 bg-muted/5 p-4 transition-all hover:bg-muted/10 {ws.id === store.workspaces.activeId ? 'border-primary/20 bg-primary/5' : ''}"
								>
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-lg border border-border/10 bg-background shadow-sm group-hover:scale-105 transition-transform"
										>
											<Layers class="h-5 w-5 {ws.id === store.workspaces.activeId ? 'text-primary' : 'text-muted-foreground'}" />
										</div>
										<div class="space-y-0.5">
											<div class="flex items-center gap-2">
												<p class="text-[14px] font-bold">{ws.name}</p>
												{#if ws.id === store.workspaces.activeId}
													<div class="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-tight">
														<Check class="h-2.5 w-2.5" />
														Active
													</div>
												{/if}
											</div>
											<p class="text-[12px] text-muted-foreground font-medium">
												{ws.linkCount || 0} {(ws.linkCount || 0) === 1 ? 'link' : 'links'} saved
											</p>
										</div>
									</div>

									<div class="flex items-center gap-2">
										{#if ws.id !== store.workspaces.activeId}
											<Button
												variant="ghost"
												size="sm"
												class="h-8 px-3 text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
												onclick={() => store.setActiveWorkspace(ws.id)}
											>
												Switch to
											</Button>
										{/if}
										
										{#if store.workspaces.count > 1}
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 rounded-full text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
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
					<section class="space-y-4">
						<div class="px-1 pt-4 border-t">
							<h3 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
								System
							</h3>
						</div>
						
						<div class="rounded-xl border border-border/10 bg-muted/5 p-4 space-y-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/10 shadow-sm">
										<Database class="h-4 w-4 text-muted-foreground" />
									</div>
									<div class="space-y-0.5">
										<p class="text-[13px] font-bold">Data Persistence</p>
										<p class="text-[11px] text-muted-foreground">SQLite (Local Server)</p>
									</div>
								</div>
								<div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
									<div class="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></div>
									<span class="text-[10px] font-bold uppercase tracking-tight">Connected</span>
								</div>
							</div>

							<div class="flex items-center gap-3 pt-2 border-t border-border/5">
								<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border/10 shadow-sm">
									<Info class="h-4 w-4 text-muted-foreground" />
								</div>
								<div class="space-y-0.5">
									<p class="text-[13px] font-bold">App Version</p>
									<p class="text-[11px] text-muted-foreground">v1.0.0-mvp</p>
								</div>
							</div>
						</div>
					</section>

					<!-- Footer Links -->
					<div class="flex items-center justify-center gap-4 pt-8 text-[11px] text-muted-foreground font-medium opacity-60">
						<a href="/" class="hover:underline">Home</a>
						<span>•</span>
						<button class="hover:underline">Terms</button>
						<span>•</span>
						<button class="hover:underline">Privacy</button>
						<span>•</span>
						<p>© 2026 LinkFeed</p>
					</div>

					<div class="h-12"></div>
				</div>
			</ScrollArea>
		</div>
	</main>

	<!-- Right Sidebar -->
	<RightSidebar />
</div>

<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content class="max-w-[400px] rounded-2xl border-none shadow-2xl p-6">
		<Dialog.Header>
			<Dialog.Title class="text-lg font-bold">Delete Workspace?</Dialog.Title>
			<Dialog.Description class="text-[14px] leading-relaxed pt-2">
				This will permanently delete <span class="font-bold text-foreground">"{workspaceToDelete?.name}"</span> and all its links. This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-6 flex flex-col gap-2 sm:flex-col">
			<Button
				variant="destructive"
				class="w-full rounded-full font-bold h-11"
				onclick={confirmDeleteWorkspace}
			>
				Delete Workspace
			</Button>
			<Button
				variant="ghost"
				class="w-full rounded-full font-bold h-11"
				onclick={() => (isDeleteDialogOpen = false)}
			>
				Cancel
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
