<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/constants';
	import { setMode } from 'mode-watcher';
	import { cn } from '$lib/utils.js';
	import { TUI, theme } from '$lib/tui';
	import LazyPanel from './tui/LazyPanel.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { X, Loader2 } from '@lucide/svelte';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { WorkspaceId } from '$lib/types';

	const store = getContext<AppStore>('store');

	let {
		onAddLink,
		onExport,
		onImport
	}: {
		onAddLink: () => void;
		onExport: () => void;
		onImport: () => void;
	} = $props();

	let isCreateWorkspaceOpen = $state(false);
	let newWorkspaceName = $state('');
	let isCreating = $state(false);

	const navItems = [
		{ id: 'inbox' as Category, label: 'Inbox', key: '1' },
		{ id: 'favorites' as Category, label: 'Favorites', key: '2' },
		{ id: 'trash' as Category, label: 'Trash', key: '3' }
	] as const;

	function handleNavClick(category: Category) {
		store.filters.setCategory(category);
		if (page.url.pathname !== '/') {
			goto('/');
		}
	}

	async function handleWorkspaceSelect(id: string) {
		await store.setActiveWorkspace(id as WorkspaceId);
	}

	async function handleCreateWorkspace() {
		const name = newWorkspaceName.trim();
		if (!name) return;

		isCreating = true;
		try {
			const result = await store.workspaces.add(name);
			if (result.ok) {
				newWorkspaceName = '';
				isCreateWorkspaceOpen = false;
				await store.setActiveWorkspace(result.value.id as WorkspaceId);
			}
		} finally {
			isCreating = false;
		}
	}

	function toggleMode() {
		const isDark = document.documentElement.classList.contains('dark');
		setMode(isDark ? 'light' : 'dark');
	}

	const activeCategory = $derived(store.filters.activeCategory);

	const sortedWorkspaces = $derived(
		[...store.workspaces.workspaces].sort((a, b) => {
			if (a.id === store.workspaces.activeId) return -1;
			if (b.id === store.workspaces.activeId) return 1;
			return 0;
		})
	);
</script>

<div class="flex h-full w-full flex-col gap-3">
	<!-- Workspace Panel -->
	<LazyPanel title="Workspaces" titleClass={theme.titleStatus} class="min-h-35 flex-1">
		<ScrollArea type="hover" class="h-full w-full">
			<div class="flex flex-col gap-0.5">
				{#each sortedWorkspaces as ws, i (ws.id)}
					{@const isActive = ws.id === store.workspaces.activeId}
					<button
						onclick={() => handleWorkspaceSelect(ws.id)}
						class={cn(
							theme.item,
							isActive ? theme.itemSelected : theme.itemDefault,
							'w-full min-w-0 px-2'
						)}
					>
						{#if isActive}
							<span class="shrink-0 font-bold text-primary">{TUI.bullet}</span>
						{:else}
							<span class="w-3 shrink-0"></span>
						{/if}
						<span class="min-w-0 flex-1 truncate text-left">{ws.name}</span>
						<span class="hidden max-w-25 shrink-0 truncate text-right text-xs opacity-50 sm:inline"
							>@{ws.slug}</span
						>
					</button>

					{#if isActive && sortedWorkspaces.length > 1}
						<div class="mx-2 my-1 border-b border-dashed border-border/30"></div>
					{/if}
				{/each}
				<button
					onclick={() => (isCreateWorkspaceOpen = true)}
					class={cn(theme.item, theme.itemDefault, 'mt-1 px-2 text-muted-foreground italic')}
				>
					<span class="w-3">{TUI.bullet}</span>
					<span>New workspace...</span>
				</button>
			</div>
		</ScrollArea>
	</LazyPanel>

	<!-- Categories Panel -->
	<LazyPanel title="Categories" titleClass={theme.titleFiles} class="min-h-35 flex-[0.8]">
		<ScrollArea type="hover" class="h-full w-full">
			<nav class="flex flex-col gap-0.5">
				{#each navItems as item (item.id)}
					{@const isActive = page.url.pathname === '/' && activeCategory === item.id}
					<button
						onclick={() => handleNavClick(item.id)}
						class={cn(theme.item, isActive ? theme.itemSelected : theme.itemDefault, 'px-2')}
					>
						<span class="w-4 text-xs opacity-50">{item.key}</span>
						<span class="flex-1 text-left">{item.label}</span>
						{#if item.id === 'inbox'}
							{@const count = store.links.links.filter((l) => !l.isDeleted).length}
							{#if count > 0}
								<span class="w-8 text-right text-xs opacity-70">[{count}]</span>
							{:else}
								<span class="w-8"></span>
							{/if}
						{:else if item.id === 'favorites'}
							{@const count = store.links.links.filter((l) => l.isFavorite && !l.isDeleted).length}
							{#if count > 0}
								<span class="w-8 text-right text-xs opacity-70">[{count}]</span>
							{:else}
								<span class="w-8"></span>
							{/if}
						{:else if item.id === 'trash'}
							{@const count = store.links.links.filter((l) => l.isDeleted).length}
							{#if count > 0}
								<span class="w-8 text-right text-xs opacity-70">[{count}]</span>
							{:else}
								<span class="w-8"></span>
							{/if}
						{/if}
					</button>
				{/each}
			</nav>
		</ScrollArea>
	</LazyPanel>

	<!-- Actions Panel -->
	<LazyPanel title="Actions" titleClass={theme.titleBranches} class="min-h-45 flex-1">
		<div class="flex flex-col gap-1">
			<button onclick={onAddLink} class={cn(theme.item, theme.itemDefault, 'px-2')}>
				<span class="w-4 text-xs opacity-50">a</span>
				<span>Add Link</span>
			</button>
			<button onclick={toggleMode} class={cn(theme.item, theme.itemDefault, 'px-2')}>
				<span class="w-4 text-xs opacity-50">t</span>
				<span>Toggle Theme</span>
			</button>
			<button onclick={onExport} class={cn(theme.item, theme.itemDefault, 'px-2')}>
				<span class="w-4 text-xs opacity-50">e</span>
				<span>Export Links</span>
			</button>
			<button onclick={onImport} class={cn(theme.item, theme.itemDefault, 'px-2')}>
				<span class="w-4 text-xs opacity-50">i</span>
				<span>Import Links</span>
			</button>
			<a
				href="/settings"
				class={cn(
					theme.item,
					page.url.pathname === '/settings' ? theme.itemSelected : theme.itemDefault,
					'px-2'
				)}
			>
				<span class="w-4 text-xs opacity-50">,</span>
				<span>Settings</span>
			</a>
		</div>
	</LazyPanel>
</div>

<!-- Create Workspace Dialog -->
<Dialog.Root bind:open={isCreateWorkspaceOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-80 overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 shadow-2xl"
	>
		<div class="flex flex-col font-mono text-foreground">
			<!-- Header -->
			<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
				<div class="flex items-center gap-2">
					<span class="text-xs font-bold tracking-tight text-foreground uppercase">
						Create Workspace
					</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1 text-muted-foreground">
						<span
							class="border border-border bg-muted px-1 py-0 text-xs font-bold text-foreground uppercase"
							>esc</span
						>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (isCreateWorkspaceOpen = false)}
						class="h-7 w-7 rounded-none border border-transparent hover:border-border hover:bg-muted"
					>
						<X class="h-4 w-4" />
					</Button>
				</div>
			</div>

			<!-- Body -->
			<div class="space-y-4 p-6">
				<div class="space-y-2">
					<Label
						for="ws-name"
						class="text-xs font-bold tracking-wider text-muted-foreground uppercase">Name</Label
					>
					<Input
						id="ws-name"
						bind:value={newWorkspaceName}
						placeholder="e.g. Personal Projects"
						class="h-8 rounded-none border border-border bg-muted/10 font-mono text-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-0"
						onkeydown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
						autofocus
					/>
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-3 py-2">
				<Button
					variant="ghost"
					onclick={() => (isCreateWorkspaceOpen = false)}
					class="h-7 rounded-none border border-border bg-background px-2 text-xs font-bold uppercase hover:bg-muted"
				>
					Cancel
				</Button>
				<Button
					onclick={handleCreateWorkspace}
					disabled={!newWorkspaceName.trim() || isCreating}
					class="h-7 rounded-none border border-primary bg-primary px-3 text-xs font-bold text-primary-foreground uppercase shadow-sm hover:bg-primary/90 active:scale-95"
				>
					{#if isCreating}
						<Loader2 class="mr-2 h-3 w-3 animate-spin" />
					{/if}
					Create
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
