<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import {
		ArrowLeft,
		Trash2,
		Layers,
		Plus,
		Database,
		Info,
		Loader2,
		Check,
		X
	} from '@lucide/svelte';
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

	// Wrapper for button click
	function handleAddWorkspaceClick() {
		handleAddWorkspace();
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
		<div
			class="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md"
		>
			<Button variant="ghost" size="icon" href="/" class="h-8 w-8 rounded-sm hover:bg-muted">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div class="flex flex-col">
				<h1 class="text-[15px] font-bold tracking-tight">Settings</h1>
				<p class="text-[11px] leading-none text-muted-foreground">
					Manage your workspaces and preferences
				</p>
			</div>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-hidden">
			<ScrollArea type="hover" class="h-full w-full">
				<div class="flex flex-col space-y-8 p-4">
					<!-- Section: Workspaces -->
					<section class="space-y-4">
						<div class="px-1">
							<h3 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
								Management
							</h3>
							<h2 class="mt-1 text-xl font-extrabold tracking-tight">Workspaces</h2>
						</div>

						<!-- Add Workspace Input -->
						<div class="px-1">
							<div class="group relative">
								<div
									class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
								>
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
									class="h-10 border-border/10 bg-muted/20 pl-10 transition-all focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
								/>
								{#if newWorkspaceName.trim() && !isAddingWorkspace}
									<button
										onclick={handleAddWorkspaceClick}
										class="absolute top-1/2 right-2 h-7 -translate-y-1/2 rounded-sm bg-primary px-3 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
									>
										Create
									</button>
								{/if}
							</div>
							{#if addError}
								<p class="mt-1 px-1 text-[11px] font-medium text-destructive">{addError}</p>
							{/if}
						</div>

						<div class="mt-4 grid gap-2">
							{#each store.workspaces.workspaces as ws (ws.id)}
								<div
									class="group relative flex items-center justify-between rounded-sm border border-border/10 bg-muted/5 p-4 transition-all hover:bg-muted/10 {ws.id ===
									store.workspaces.activeId
										? 'border-primary/20 bg-primary/5'
										: ''}"
								>
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-sm border border-border/10 bg-background shadow-sm transition-transform group-hover:scale-105"
										>
											<Layers
												class="h-5 w-5 {ws.id === store.workspaces.activeId
													? 'text-primary'
													: 'text-muted-foreground'}"
											/>
										</div>
										<div class="space-y-0.5">
											<div class="flex items-center gap-2">
												<p class="text-[14px] font-bold">{ws.name}</p>
												{#if ws.id === store.workspaces.activeId}
													<div
														class="flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold tracking-tight text-primary uppercase"
													>
														<Check class="h-2.5 w-2.5" />
														Active
													</div>
												{/if}
											</div>
											<p class="text-[12px] font-medium text-muted-foreground">
												{ws.linkCount || 0}
												{(ws.linkCount || 0) === 1 ? 'link' : 'links'} saved
											</p>
										</div>
									</div>

									<div class="flex items-center gap-2">
										{#if ws.id !== store.workspaces.activeId}
											<Button
												variant="ghost"
												size="sm"
												class="h-8 px-3 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
												onclick={() => store.setActiveWorkspace(ws.id)}
											>
												Switch to
											</Button>
										{/if}

										{#if store.workspaces.count > 1}
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 rounded-sm text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
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
						<div class="border-t px-1 pt-4">
							<h3 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
								System
							</h3>
						</div>

						<div class="space-y-4 rounded-sm border border-border/10 bg-muted/5 p-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-sm border border-border/10 bg-background shadow-sm"
									>
										<Database class="h-4 w-4 text-muted-foreground" />
									</div>
									<div class="space-y-0.5">
										<p class="text-[13px] font-bold">Data Persistence</p>
										<p class="text-[11px] text-muted-foreground">SQLite (Local Server)</p>
									</div>
								</div>
								<div
									class="flex items-center gap-1.5 rounded-sm bg-green-500/10 px-2 py-1 text-green-600 dark:text-green-400"
								>
									<div class="h-1.5 w-1.5 animate-pulse rounded-sm bg-current"></div>
									<span class="text-[10px] font-bold tracking-tight uppercase">Connected</span>
								</div>
							</div>

							<div class="flex items-center gap-3 border-t border-border/5 pt-2">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-sm border border-border/10 bg-background shadow-sm"
								>
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
					<div
						class="flex items-center justify-center gap-4 pt-8 text-[11px] font-medium text-muted-foreground opacity-60"
					>
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
	<Dialog.Content showCloseButton={false} class="max-w-[400px] overflow-hidden rounded-sm p-0">
		<div class="flex flex-col bg-background text-foreground">
			<!-- Header -->
			<div class="flex h-11 items-center justify-between border-b border-border px-4">
				<h2 class="text-[13px] font-semibold tracking-tight text-foreground/90">
					Delete Workspace
				</h2>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (isDeleteDialogOpen = false)}
					class="h-7 w-7 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<X class="h-3.5 w-3.5" />
				</Button>
			</div>

			<!-- Body -->
			<div class="space-y-3 px-4 py-4">
				<p class="text-[13px] leading-relaxed text-muted-foreground">
					This will permanently delete the workspace and all its links. This action cannot be
					undone.
				</p>
				<div class="rounded-sm border border-border/50 bg-muted/20 px-3 py-2">
					<span class="text-[13px] font-medium text-foreground">
						{workspaceToDelete?.name}
					</span>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
				<Button
					variant="ghost"
					onclick={() => (isDeleteDialogOpen = false)}
					class="h-8 rounded-sm px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
				>
					Cancel
				</Button>
				<Button
					variant="destructive"
					onclick={confirmDeleteWorkspace}
					class="h-8 rounded-sm px-4 text-[12px] font-medium shadow-sm"
				>
					Delete Workspace
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
