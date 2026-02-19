<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Layers, Plus, Database, Info, Loader2, X } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { WorkspaceId, ThemeId } from '$lib/types';
	import { THEMES } from '$lib/constants';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import ImportDialog from '$lib/components/ImportDialog.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import LazyStatusBar from '$lib/components/tui/LazyStatusBar.svelte';
	import LazyPanel from '$lib/components/tui/LazyPanel.svelte';
	import { theme, TUI } from '$lib/tui';
	import { cn } from '$lib/utils';
	import type { Link } from '$lib/types';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import TuiMobileNav from '$lib/components/TuiMobileNav.svelte';

	const store = getContext<AppStore>('store');
	const isMobile = new IsMobile();

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

	// Add/Export Link State
	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let isImportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);
	let previewData = $state<{
		url: string;
		title: string | null;
		description: string | null;
		image: string | null;
		logo: string | null;
	} | null>(null);

	$effect(() => {
		if (!isAddDialogOpen) {
			editingLink = null;
			previewData = null;
		}
	});

	function handleAddLink() {
		editingLink = null;
		isAddDialogOpen = true;
	}

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

	// Reactive link counts per workspace
	const workspaceStats = $derived.by(() => {
		const stats: Record<string, number> = {};
		store.workspaces.workspaces.forEach((ws) => {
			// If it's the active workspace, use the current links store
			if (ws.id === store.workspaces.activeId) {
				stats[ws.id] = store.links.links.filter((l) => !l.isDeleted).length;
			} else {
				// Fallback to server-provided count for background workspaces
				stats[ws.id] = ws.linkCount || 0;
			}
		});
		return stats;
	});
</script>

<!-- Layout Container - Lazygit Style -->
<div
	class={cn(
		theme.app,
		'relative h-[99dvh] w-screen overflow-hidden bg-background p-1 md:p-2',
		!isMobile.matches ? '' : 'pb-15'
	)}
>
	<div class="relative flex h-full overflow-hidden border-2 border-border p-2">
		<!-- Main Content Area -->
		<div
			class="flex h-full w-full gap-0 overflow-hidden pt-3 md:gap-2 md:p-1 md:pb-6 lg:gap-4 lg:p-4 lg:pb-8"
		>
			<!-- Left Sidebar -->
			<aside class="hidden h-full min-w-0 overflow-y-auto p-2 md:flex! md:w-60 md:shrink-0 lg:w-75">
				<LeftSidebar
					onAddLink={handleAddLink}
					onExport={() => (isExportDialogOpen = true)}
					onImport={() => (isImportDialogOpen = true)}
				/>
			</aside>

			<!-- Center Content (Settings) -->
			<main class={cn(theme.layoutContent, 'flex h-full min-w-0 flex-1 flex-col')}>
				<LazyPanel
					title="Settings"
					titleClass={theme.titleBranches}
					focused={true}
					class="flex-1"
					counter="Workspace Management"
				>
					{#snippet subtitle()}
						<div class="ml-2 flex items-center gap-2">
							<a
								href="/"
								class="text-[10px] font-bold text-muted-foreground uppercase hover:text-foreground"
							>
								[b]ack to home
							</a>
						</div>
					{/snippet}

					<!-- Scrollable Content -->
					<div class="mt-1 min-h-0 flex-1 overflow-hidden">
						<ScrollArea type="hover" class="h-full w-full">
							<div class="flex flex-col space-y-6 p-2 pb-10">
								<!-- Section: Workspaces -->
								<section class="space-y-4">
									<div>
										<h2
											class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
										>
											Workspaces
										</h2>
									</div>

									<!-- Add Workspace Input -->
									<div class="group relative">
										<div
											class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
										>
											{#if isAddingWorkspace}
												<Loader2 class="h-3.5 w-3.5 animate-spin" />
											{:else}
												<Plus class="h-3.5 w-3.5" />
											{/if}
										</div>
										<Input
											bind:value={newWorkspaceName}
											onkeydown={handleAddWorkspace}
											placeholder="Create new workspace..."
											class="h-8 rounded-none border-border/20 bg-muted/20 pl-9 font-mono text-[13px] transition-all focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
										/>
										{#if newWorkspaceName.trim() && !isAddingWorkspace}
											<button
												onclick={handleAddWorkspaceClick}
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
													ws.id === store.workspaces.activeId
														? 'bg-primary/10'
														: 'hover:bg-muted/50'
												)}
											>
												<div class="flex min-w-0 flex-1 items-center gap-2">
													<Layers
														class={cn(
															'h-3.5 w-3.5 shrink-0',
															ws.id === store.workspaces.activeId
																? 'text-primary'
																: 'text-muted-foreground'
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
														<span class="text-[10px] font-bold text-primary uppercase"
															>[active]</span
														>
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

								<!-- Section: Appearance -->
								<section class="space-y-4">
									<div class="border-t border-border/20 pt-4">
										<h2
											class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
										>
											Appearance
										</h2>
									</div>

									<div class="grid gap-1">
										{#each Object.entries(THEMES) as [key, value] (value)}
											<button
												onclick={() => store.theme.setTheme(value as unknown as ThemeId)}
												class={cn(
													theme.item,
													'group w-full px-2 py-1 text-left',
													store.theme.current === value ? 'bg-primary/10' : 'hover:bg-muted/50'
												)}
											>
												<div class="flex flex-1 items-center gap-2">
													<div
														class={cn(
															'h-3 w-3 rounded-full border border-border',
															value === 'default' ? 'bg-[#8b5cf6]' : 'bg-[#83c092]'
														)}
													></div>
													<span
														class={cn(
															'font-bold capitalize',
															store.theme.current === value ? 'text-primary' : ''
														)}
													>
														{value}
													</span>
													{#if store.theme.current === value}
														<span class="ml-auto text-[10px] font-bold text-primary uppercase"
															>[selected]</span
														>
													{/if}
												</div>
											</button>
										{/each}
									</div>
								</section>

								<!-- Section: System Info -->
								<section class="space-y-4">
									<div class="border-t border-border/20 pt-4">
										<h3
											class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
										>
											System
										</h3>
									</div>

									<div class="space-y-2">
										<div class="flex items-center justify-between px-2 py-1">
											<div class="flex items-center gap-2">
												<Database class="h-3.5 w-3.5 text-muted-foreground" />
												<span class="text-[13px]">Data Persistence</span>
											</div>
											<div class="flex items-center gap-2">
												<span class="text-[11px] text-muted-foreground">SQLite</span>
												<span
													class="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase"
												>
													<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
													Connected
												</span>
											</div>
										</div>

										<div class="flex items-center justify-between px-2 py-1">
											<div class="flex items-center gap-2">
												<Info class="h-3.5 w-3.5 text-muted-foreground" />
												<span class="text-[13px]">App Version</span>
											</div>
											<span class="font-mono text-[11px] text-primary">v1.0.0-mvp</span>
										</div>
									</div>
								</section>

								<!-- Footer -->
								<div class="border-t border-border/20 pt-4 text-center">
									<p class="text-[11px] text-muted-foreground">
										© 2026 LinkFeed • Local-First Bookmark Manager
									</p>
								</div>
							</div>
						</ScrollArea>
					</div>
				</LazyPanel>
			</main>

			<!-- Right Sidebar -->
			<aside
				class="hidden h-full min-w-0 overflow-y-auto p-2 md:hidden lg:!flex lg:w-[260px] lg:shrink-0 xl:w-[300px]"
			>
				<RightSidebar />
			</aside>
		</div>

		<!-- Status Bar -->
		<div class="absolute right-0 bottom-0 left-0 z-40 hidden md:flex">
			<LazyStatusBar />
		</div>
	</div>
</div>

<!-- Mobile Navigation Bar (TUI Style) -->
<div class="fixed right-0 bottom-0 left-0 z-50 block md:hidden">
	<TuiMobileNav activeTab="links" />
</div>

<!-- Deletion Dialog - Styled to match Lazygit -->
<Dialog.Root bind:open={isDeleteDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-md overflow-hidden rounded-none border-2 border-border bg-background p-0 font-mono shadow-2xl"
	>
		<div class="flex flex-col">
			<!-- Header -->
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

			<!-- Body -->
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

			<!-- Footer -->
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

<!-- Add Link Dialog -->
<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-border bg-background p-0 shadow-2xl lg:max-w-2xl"
	>
		<LinkForm
			link={editingLink}
			{previewData}
			onsave={() => (isAddDialogOpen = false)}
			oncancel={() => (isAddDialogOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<!-- Export Link Dialog -->
<Dialog.Root bind:open={isExportDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-border bg-background p-0 lg:max-w-md"
	>
		<ExportDialog
			bind:open={isExportDialogOpen}
			links={store.links.links.filter((l) => !l.isDeleted)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isImportDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-border bg-background p-0 lg:max-w-xl"
	>
		<ImportDialog bind:open={isImportDialogOpen} />
	</Dialog.Content>
</Dialog.Root>
