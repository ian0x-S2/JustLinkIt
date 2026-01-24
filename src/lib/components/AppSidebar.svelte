<script lang="ts">
	import {
		Inbox,
		Star,
		Archive,
		Trash2,
		Settings,
		Moon,
		Sun,
		Command,
		Plus,
		ChevronsUpDown,
		Check,
		LogOut
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
	import type { LinkStore } from '$lib/store.svelte';

	const store = getContext<LinkStore>('store');

	const navMain = [
		{ id: 'inbox', title: 'Inbox', icon: Inbox },
		{ id: 'favorites', title: 'Favorites', icon: Star },
		{ id: 'archive', title: 'Archive', icon: Archive },
		{ id: 'trash', title: 'Trash', icon: Trash2 }
	] as const;

	let isCreateWorkspaceOpen = $state(false);
	let newWorkspaceName = $state('');

	function toggleMode() {
		const isDark = document.documentElement.classList.contains('dark');
		setMode(isDark ? 'light' : 'dark');
	}

	async function handleWorkspaceSwitch(id: string) {
		await store.setActiveWorkspace(id);
		if (page.url.pathname !== '/') {
			await goto('/');
		}
	}

	async function handleCategorySwitch(category: typeof navMain[number]['id']) {
		store.activeCategory = category;
		if (page.url.pathname !== '/') {
			await goto('/');
		}
	}

	async function handleCreateWorkspace(e?: Event) {
		e?.preventDefault();
		const name = newWorkspaceName.trim();
		if (name) {
			try {
				const newWs = await store.addWorkspace(name);
				if (newWs && newWs.id) {
					await store.setActiveWorkspace(newWs.id);
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

<Sidebar.Root collapsible="icon" class="border-r">
	<Sidebar.Header class="flex h-12 flex-col justify-center border-b p-0 px-2">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class="flex w-full items-center justify-start gap-2 overflow-hidden rounded-md py-1.5 pr-2 pl-1.5 transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:bg-muted/50"
			>
				<div
					class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"
				>
					<Command class="h-3.5 w-3.5" />
				</div>
				<div
					class="flex min-w-0 flex-1 flex-col items-start group-data-[collapsible=icon]:hidden"
				>
					<span class="truncate text-[13px] leading-none font-bold tracking-tight">
						{store.activeWorkspace?.name || 'Workspace'}
					</span>
					<span class="mt-0.5 text-[10px] leading-none text-muted-foreground">Free Plan</span>
				</div>
				<ChevronsUpDown
					class="h-3.5 w-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden"
				/>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-md border p-1 shadow-lg"
			>
				<DropdownMenu.Label
					class="w-full px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
				>
					Workspaces
				</DropdownMenu.Label>
				<DropdownMenu.Group>
					{#each store.workspaces as ws (ws.id)}
						<DropdownMenu.Item
							onclick={() => handleWorkspaceSwitch(ws.id)}
							class="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[13px]"
						>
							<div class="flex items-center gap-2">
								<div
									class="flex h-5 w-5 items-center justify-center rounded border bg-muted/30 text-[10px] font-bold"
								>
									{ws.name?.[0] || '?'}
								</div>
								<span class={ws.id === store.activeWorkspace?.id ? 'font-semibold' : ''}>{ws.name || 'Untitled'}</span>
							</div>
							{#if ws.id === store.activeWorkspace.id}
								<Check class="h-3.5 w-3.5 text-primary" />
							{/if}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
				<DropdownMenu.Separator class="my-1" />
				<DropdownMenu.Item
					onclick={() => (isCreateWorkspaceOpen = true)}
					class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
				>
					<Plus class="h-3.5 w-3.5" />
					<span>Create Workspace</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
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
								isActive={page.url.pathname === '/' && store.activeCategory === item.id}
								onclick={() => handleCategorySwitch(item.id)}
								class="h-8 rounded-md px-3 text-[13px] transition-colors hover:bg-muted/50 data-[active=true]:bg-muted data-[active=true]:font-medium"
							>
								{#snippet tooltipContent()}
									{item.title}
								{/snippet}
								<item.icon class="mr-2 h-4 w-4" />
								<span class="group-data-[collapsible=icon]:hidden">{item.title}</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group class="mt-auto border-t pt-2">
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton
						onclick={() => (isCreateWorkspaceOpen = true)}
						class="h-8 rounded-md px-3 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
					>
						<Plus class="mr-2 h-4 w-4" />
						<span class="group-data-[collapsible=icon]:hidden">New Workspace</span>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer class="border-t p-2">
		<div class="flex flex-col gap-1 group-data-[collapsible=icon]:items-center">
			<!-- Theme Toggle -->
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-full justify-start gap-2 rounded-md px-2 text-[12px] font-medium text-muted-foreground group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:text-foreground"
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
					"h-8 w-full justify-start gap-2 rounded-md px-2 text-[12px] font-medium text-muted-foreground group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 hover:text-foreground",
					page.url.pathname === '/settings' && "bg-muted text-foreground"
				)}
			>
				<Settings class="h-3.5 w-3.5" />
				<span class="group-data-[collapsible=icon]:hidden">Settings</span>
			</Button>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>

<Dialog.Root bind:open={isCreateWorkspaceOpen}>
	<Dialog.Content class="max-w-[320px] rounded-lg">
		<Dialog.Header>
			<Dialog.Title class="text-[15px] font-semibold">Create Workspace</Dialog.Title>
			<Dialog.Description class="text-[12px] text-muted-foreground">
				Workspaces help you organize links for different projects.
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleCreateWorkspace} class="mt-4 flex flex-col gap-4">
			<div class="flex flex-col gap-2">
				<Label for="ws-name" class="text-[11px] font-medium text-muted-foreground uppercase"
					>Name</Label
				>
				<Input
					id="ws-name"
					bind:value={newWorkspaceName}
					placeholder="My New Project"
					class="h-9 text-[13px] focus-visible:ring-1"
					autofocus
				/>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					class="h-8 px-3 text-[12px]"
					onclick={() => (isCreateWorkspaceOpen = false)}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					size="sm"
					class="h-8 px-3 text-[12px]"
					disabled={!newWorkspaceName.trim()}
				>
					Create
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
