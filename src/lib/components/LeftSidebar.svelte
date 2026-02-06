<script lang="ts">
	import {
		Inbox,
		Star,
		Archive,
		Trash2,
		Settings,
		Plus,
		Moon,
		Sun,
		FileBraces,
		Ellipsis
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/constants';
	import { setMode } from 'mode-watcher';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input';

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
		{ id: 'inbox' as Category, label: 'Inbox', icon: Inbox },
		{ id: 'favorites' as Category, label: 'Favorites', icon: Star },
		{ id: 'archive' as Category, label: 'Archive', icon: Archive },
		{ id: 'trash' as Category, label: 'Trash', icon: Trash2 }
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

<aside class="sticky top-0 flex h-screen w-17 shrink-0 flex-col bg-background xl:w-68.75">
	<!-- Workspace Switcher (Replaces Logo) -->
	<div class="flex h-14 items-center px-2 xl:px-3">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="flex w-full items-center justify-center gap-2.5 rounded-md p-2 transition-colors hover:bg-muted/80 xl:justify-start"
			>
				<div
					class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground"
				>
					{store.workspaces.active?.name?.[0] || '?'}
				</div>
				<div class="hidden min-w-0 flex-1 text-left xl:block">
					<p class="truncate text-[13px] leading-none font-bold">
						{store.workspaces.active?.name || 'Workspace'}
					</p>
					<p class="truncate text-[11px] leading-normal text-muted-foreground">
						@{store.workspaces.active?.slug || 'workspace'}
					</p>
				</div>
				<Ellipsis class="ml-auto hidden h-4 w-4 text-muted-foreground xl:block" />
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-17  rounded-sm shadow-xl"
				align="start"
				side="bottom"
				sideOffset={4}
			>
				<DropdownMenu.Label
					class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
					>Switch Workspace</DropdownMenu.Label
				>
				<DropdownMenu.Separator />
				<div class="max-h-75 overflow-y-auto p-1">
					{#each store.workspaces.workspaces as ws (ws.id)}
						<DropdownMenu.Item
							onclick={() => handleWorkspaceSelect(ws.id)}
							class="flex items-center gap-2.5 px-2 py-2 {ws.id === store.workspaces.activeId
								? 'bg-muted'
								: ''}"
						>
							<div
								class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary"
							>
								{ws.name[0]}
							</div>
							<div class="flex flex-1 flex-col">
								<span class="text-[13px] leading-none font-bold">{ws.name}</span>
								<span class="text-[11px] text-muted-foreground">@{ws.slug}</span>
							</div>
						</DropdownMenu.Item>
					{/each}
				</div>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onclick={() => (isCreateWorkspaceOpen = true)}
					class="cursor-pointer px-2 py-2"
				>
					<Plus class="mr-2 h-3.5 w-3.5" />
					<span class="text-[13px] font-medium">Create New Workspace</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>

	<!-- Create Workspace Dialog -->
	<Dialog.Root bind:open={isCreateWorkspaceOpen}>
		<Dialog.Content class="max-w-[400px] rounded-2xl border-none p-6 shadow-2xl">
			<Dialog.Header>
				<Dialog.Title class="text-lg font-bold">New Workspace</Dialog.Title>
				<Dialog.Description class="pt-1 text-[14px]">
					Create a new space to organize your links.
				</Dialog.Description>
			</Dialog.Header>
			<div class="py-4">
				<Input
					bind:value={newWorkspaceName}
					placeholder="Workspace name..."
					class="h-11 rounded-xl border-none bg-muted/20 transition-all focus-visible:ring-2 focus-visible:ring-primary"
					onkeydown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
				/>
			</div>
			<Dialog.Footer class="flex flex-col gap-2 sm:flex-col">
				<Button
					class="h-11 w-full rounded-full font-bold"
					onclick={handleCreateWorkspace}
					disabled={!newWorkspaceName.trim() || isCreating}
				>
					{isCreating ? 'Creating...' : 'Create Workspace'}
				</Button>
				<Button
					variant="ghost"
					class="h-11 w-full rounded-full font-bold"
					onclick={() => (isCreateWorkspaceOpen = false)}
				>
					Cancel
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Navigation -->
	<nav class="flex flex-1 flex-col gap-0.5 px-2 py-2 xl:px-3">
		{#each navItems as item (item.id)}
			{@const isActive = page.url.pathname === '/' && activeCategory === item.id}
			<Button
				variant="ghost"
				class="flex h-9 w-full items-center justify-center gap-0 rounded-md px-0 text-[14px] transition-colors hover:bg-muted/80 xl:justify-start xl:gap-3 xl:px-3 {isActive
					? 'bg-muted/40 font-bold text-foreground'
					: 'font-medium text-muted-foreground hover:text-foreground'}"
				onclick={() => handleNavClick(item.id)}
			>
				<item.icon class="h-4.5 w-4.5 shrink-0 {isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}" />
				<span class="hidden xl:inline">{item.label}</span>
				{#if item.id === 'inbox'}
					{@const count = store.links.links.filter((l) => !l.isArchived && !l.isDeleted).length}
					{#if count > 0}
						<span
							class="ml-auto hidden h-4.5 min-w-4.5 items-center justify-center rounded-md bg-primary/10 px-1 text-[10px] font-bold text-primary xl:flex"
						>
							{count > 99 ? '99+' : count}
						</span>
					{/if}
				{/if}
			</Button>
		{/each}
	</nav>

	<!-- Bottom Actions -->
	<div class="flex flex-col gap-1 px-2 py-4 xl:px-3">
		<!-- Quick Actions -->
		<Button
			variant="ghost"
			class="flex h-9 w-full items-center justify-center gap-0 rounded-md px-0 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground xl:justify-start xl:gap-3 xl:px-3"
			onclick={toggleMode}
		>
			<div class="relative flex h-4.5 w-4.5 items-center justify-center">
				<Sun class="h-4.5 w-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon
					class="absolute h-4.5 w-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
			</div>
			<span class="hidden xl:inline">Toggle Theme</span>
		</Button>

		<Button
			variant="ghost"
			class="flex h-9 w-full items-center justify-center gap-0 rounded-md px-0 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground xl:justify-start xl:gap-3 xl:px-3"
			onclick={onExport}
		>
			<FileBraces class="h-4.5 w-4.5" />
			<span class="hidden xl:inline">Export</span>
		</Button>

		<Button
			variant="ghost"
			class="flex h-9 w-full items-center justify-center gap-0 rounded-md px-0 text-[14px] transition-colors hover:bg-muted/80 xl:justify-start xl:gap-3 xl:px-3 {page
				.url.pathname === '/settings'
				? 'bg-muted/40 font-bold text-foreground'
				: 'font-medium text-muted-foreground hover:text-foreground'}"
			href="/settings"
		>
			<Settings
				class="h-4.5 w-4.5 {page.url.pathname === '/settings' ? 'stroke-[2.5px]' : 'stroke-[2px]'}"
			/>
			<span class="hidden xl:inline">Settings</span>
		</Button>
	</div>
</aside>
