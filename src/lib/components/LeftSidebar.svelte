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

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	const store = getContext<AppStore>('store');

	let {
		onAddLink,
		onExport
	}: {
		onAddLink: () => void;
		onExport: () => void;
	} = $props();

	let isCreateWorkspaceOpen = $state(false);
	let newWorkspaceName = $state('');
	let isCreating = $state(false);

	const navItems = [
		{ id: 'inbox' as Category, label: 'Inbox', key: '1' },
		{ id: 'favorites' as Category, label: 'Favorites', key: '2' },
		{ id: 'archive' as Category, label: 'Archive', key: '3' },
		{ id: 'trash' as Category, label: 'Trash', key: '4' }
	] as const;

	function handleNavClick(category: Category) {
		store.filters.setCategory(category);
		if (page.url.pathname !== '/') {
			goto('/');
		}
	}

	async function handleWorkspaceSelect(id: string) {
		await store.setActiveWorkspace(id as any);
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
				await store.setActiveWorkspace(result.value.id);
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
</script>

<aside class={theme.sidebar}>
	<!-- Workspace Panel -->
	<LazyPanel title="Workspaces" titleClass={theme.titleStatus} class="flex-[0.8] min-h-[120px]">
		<div class="flex flex-col gap-0.5">
			{#each store.workspaces.workspaces as ws (ws.id)}
				{@const isActive = ws.id === store.workspaces.activeId}
				<button
					onclick={() => handleWorkspaceSelect(ws.id)}
					class={cn(
						theme.item,
						isActive ? theme.itemSelected : theme.itemDefault,
						'px-2 py-1'
					)}
				>
					{#if isActive}
						<span class="text-foreground font-bold">{TUI.bullet}</span>
					{:else}
						<span class="w-3"></span>
					{/if}
					<span class="flex-1 text-left truncate">{ws.name}</span>
					<span class="text-[10px] opacity-50">@{ws.slug}</span>
				</button>
			{/each}
			<button
				onclick={() => (isCreateWorkspaceOpen = true)}
				class={cn(theme.item, theme.itemDefault, 'px-2 py-1 text-muted-foreground italic')}
			>
				<span class="w-3">{TUI.bullet}</span>
				<span>New workspace...</span>
			</button>
		</div>
	</LazyPanel>

	<!-- Categories Panel -->
	<LazyPanel title="Categories" titleClass={theme.titleFiles} class="flex-1">
		<nav class="flex flex-col gap-0.5">
			{#each navItems as item (item.id)}
				{@const isActive = page.url.pathname === '/' && activeCategory === item.id}
				<button
					onclick={() => handleNavClick(item.id)}
					class={cn(
						theme.item,
						isActive ? theme.itemSelected : theme.itemDefault,
						'px-2 py-1'
					)}
				>
					<span class="w-4 text-[10px] opacity-50">{item.key}</span>
					<span class="flex-1 text-left">{item.label}</span>
					{#if item.id === 'inbox'}
						{@const count = store.links.links.filter((l) => !l.isArchived && !l.isDeleted).length}
						{#if count > 0}
							<span class="text-[10px] opacity-70">[{count}]</span>
						{/if}
					{/if}
					{#if isActive}
						<span class="text-[10px]">{TUI.arrowRight}</span>
					{/if}
				</button>
			{/each}
		</nav>
	</LazyPanel>

	<!-- Actions Panel -->
	<LazyPanel title="Actions" titleClass={theme.titleBranches} class="flex-[0.6]">
		<div class="flex flex-col gap-0.5">
			<button
				onclick={onAddLink}
				class={cn(theme.item, theme.itemDefault, 'px-2 py-1')}
			>
				<span class="w-4 text-[10px] opacity-50">a</span>
				<span>Add Link</span>
			</button>
			<button
				onclick={toggleMode}
				class={cn(theme.item, theme.itemDefault, 'px-2 py-1')}
			>
				<span class="w-4 text-[10px] opacity-50">t</span>
				<span>Toggle Theme</span>
			</button>
			<button
				onclick={onExport}
				class={cn(theme.item, theme.itemDefault, 'px-2 py-1')}
			>
				<span class="w-4 text-[10px] opacity-50">e</span>
				<span>Export Links</span>
			</button>
			<a
				href="/settings"
				class={cn(
					theme.item,
					page.url.pathname === '/settings' ? theme.itemSelected : theme.itemDefault,
					'px-2 py-1'
				)}
			>
				<span class="w-4 text-[10px] opacity-50">,</span>
				<span>Settings</span>
			</a>
		</div>
	</LazyPanel>
</aside>

<!-- Create Workspace Dialog -->
<Dialog.Root bind:open={isCreateWorkspaceOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="max-w-[320px] overflow-hidden border-2 border-foreground bg-background p-0 rounded-none"
	>
		<div class="flex flex-col text-foreground font-mono">
			<div class="flex h-11 items-center justify-between border-b border-border px-4">
				<h2 class="text-[13px] font-bold uppercase tracking-tight text-destructive">
					Create Workspace
				</h2>
			</div>

			<div class="space-y-4 px-4 py-4">
				<div class="space-y-1.5">
					<Label for="ws-name" class="text-[11px] uppercase text-muted-foreground">Name</Label>
					<Input
						id="ws-name"
						bind:value={newWorkspaceName}
						placeholder="Project Name"
						class="h-9 border border-border bg-background text-[13px] focus-visible:border-foreground focus-visible:ring-0 rounded-none"
						onkeydown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
						autofocus
					/>
				</div>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
				<Button
					variant="ghost"
					onclick={() => (isCreateWorkspaceOpen = false)}
					class="h-8 px-3 text-[12px] hover:bg-muted/50"
				>
					Cancel
				</Button>
				<Button
					onclick={handleCreateWorkspace}
					disabled={!newWorkspaceName.trim() || isCreating}
					class="h-8 px-4 text-[12px] bg-foreground text-background hover:bg-foreground/90 rounded-none"
				>
					Create
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>