<script lang="ts">
	import {
		Inbox,
		Star,
		Trash2,
		Settings,
		Moon,
		Sun,
		Command,
		Plus,
		ChevronsUpDown,
		Check,
		LogOut,
		X
	} from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { setMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { AppStore } from '$lib/stores';
	import type { WorkspaceId } from '$lib/types';

	const store = getContext<AppStore>('store');

	const navMain = [
		{ id: 'inbox', title: 'Inbox', icon: Inbox },
		{ id: 'favorites', title: 'Favorites', icon: Star },
		{ id: 'trash', title: 'Trash', icon: Trash2 }
	] as const;

	let isCreateWorkspaceOpen = $state(false);
	let newWorkspaceName = $state('');

	function toggleMode() {
		const isDark = document.documentElement.classList.contains('dark');
		setMode(isDark ? 'light' : 'dark');
	}

	async function handleWorkspaceSwitch(id: string) {
		await store.setActiveWorkspace(id as WorkspaceId);
		if (page.url.pathname !== '/') {
			await goto('/');
		}
	}

	async function handleCategorySwitch(category: (typeof navMain)[number]['id']) {
		store.filters.setCategory(category);
		if (page.url.pathname !== '/') {
			await goto('/');
		}
	}

	async function handleCreateWorkspace(e?: Event) {
		e?.preventDefault();
		const name = newWorkspaceName.trim();
		if (name) {
			try {
				const result = await store.workspaces.add(name);
				if (result.ok && result.value.id) {
					await store.setActiveWorkspace(result.value.id);
					newWorkspaceName = '';
					isCreateWorkspaceOpen = false;
					if (page.url.pathname !== '/') {
						await goto('/');
					}
				}
			} catch (err) {
				console.error('Failed to create workspace:', err);
			}
		}
	}
</script>

<Sidebar.Root collapsible="icon" class="border-r  ">
	<Sidebar.Header class=" flex h-12 flex-col justify-center border-t border-b p-0 px-2">
		<div class="w-full">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="flex w-full items-center justify-start gap-2 overflow-hidden rounded-sm bg-red-300 py-1.5 pr-2 pl-1.5 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:bg-muted/50"
				>
					<div
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-primary text-[11px] font-bold text-primary-foreground shadow-sm"
					>
						{store.workspaces.active?.name?.[0] || '?'}
					</div>
					<div class="flex min-w-0 flex-1 items-center group-data-[collapsible=icon]:hidden">
						<span class="truncate text-[13px] font-bold tracking-tight">
							{store.workspaces.active?.name || 'Workspace'}
						</span>
					</div>
					<ChevronsUpDown
						class="h-3.5 w-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-sm border p-1 shadow-lg"
				>
					<DropdownMenu.Label
						class="w-full px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
					>
						Workspaces
					</DropdownMenu.Label>
					<DropdownMenu.Group>
						{#each store.workspaces.workspaces as ws (ws.id)}
							<DropdownMenu.Item
								onclick={() => handleWorkspaceSwitch(ws.id)}
								class="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-[13px]"
							>
								<div class="flex items-center gap-2">
									<div
										class="flex h-5 w-5 items-center justify-center rounded border bg-muted/30 text-[10px] font-bold"
									>
										{ws.name?.[0] || '?'}
									</div>
									<span class={ws.id === store.workspaces.active?.id ? 'font-semibold' : ''}
										>{ws.name || 'Untitled'}</span
									>
								</div>
								{#if ws.id === store.workspaces.activeId}
									<Check class="h-3.5 w-3.5 text-primary" />
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
					<DropdownMenu.Separator class="my-1" />
					<DropdownMenu.Item
						onclick={() => (isCreateWorkspaceOpen = true)}
						class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
					>
						<Plus class="h-3.5 w-3.5" />
						<span>Create Workspace</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel
				class="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground/50 uppercase"
			>
				Library
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navMain as item (item.id)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								isActive={page.url.pathname === '/' && store.filters.activeCategory === item.id}
								onclick={() => handleCategorySwitch(item.id)}
								class="h-8 rounded-sm px-3 text-[13px] transition-colors hover:bg-sidebar-accent/50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium"
							>
								{#snippet tooltipContent()}
									{item.title}
								{/snippet}
								<item.icon class="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
								<span class="group-data-[collapsible=icon]:hidden">{item.title}</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="border-t p-2">
		<div class="flex flex-col gap-1 group-data-[collapsible=icon]:items-center">
			<!-- Theme Toggle -->
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-full justify-start gap-2 rounded-sm px-2 text-[12px] font-medium text-muted-foreground group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:text-foreground"
				onclick={toggleMode}
			>
				<div class="relative flex h-4 w-4 items-center justify-center">
					<Sun class="h-3.5 w-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon
						class="absolute h-3.5 w-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
				</div>
				<span class="group-data-[collapsible=icon]:hidden">Toggle Theme</span>
			</Button>

			<!-- Settings -->
			<Button
				variant="ghost"
				size="sm"
				href="/settings"
				class={cn(
					'h-8 w-full justify-start gap-2 rounded-sm px-2 text-[12px] font-medium text-muted-foreground group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:text-foreground',
					page.url.pathname === '/settings' && 'bg-muted text-foreground'
				)}
			>
				<Settings class="h-3.5 w-3.5" />
				<span class="group-data-[collapsible=icon]:hidden">Settings</span>
			</Button>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>

<Dialog.Root bind:open={isCreateWorkspaceOpen}>
	<Dialog.Content showCloseButton={false} class="overflow-hidden p-0 max-w-[320px] rounded-sm">
		<div class="flex flex-col bg-background text-foreground">
			<!-- Header -->
			<div class="flex h-11 items-center justify-between border-b border-border px-4">
				<h2 class="text-[13px] font-semibold tracking-tight text-foreground/90">
					Create Workspace
				</h2>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (isCreateWorkspaceOpen = false)}
					class="h-7 w-7 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<X class="h-3.5 w-3.5" />
				</Button>
			</div>

			<!-- Body -->
			<form onsubmit={handleCreateWorkspace}>
				<div class="space-y-4 px-4 py-4">
					<p class="text-[12px] text-muted-foreground leading-snug">
						Workspaces help you organize links for different projects.
					</p>
					<div class="space-y-1.5">
						<Label for="ws-name" class="text-[12px] font-medium text-muted-foreground">Name</Label>
						<Input
							id="ws-name"
							bind:value={newWorkspaceName}
							placeholder="My New Project"
							class="h-9 rounded-sm border-border bg-muted/10 text-[13px] transition-all focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/50"
							autofocus
						/>
					</div>
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-end gap-2 border-t border-border px-4 py-2.5">
					<Button
						variant="ghost"
						onclick={() => (isCreateWorkspaceOpen = false)}
						class="h-8 rounded-sm px-3 text-[12px] font-medium text-muted-foreground hover:text-foreground"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!newWorkspaceName.trim()}
						class="h-8 rounded-sm px-4 text-[12px] font-medium shadow-sm"
					>
						Create
					</Button>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
