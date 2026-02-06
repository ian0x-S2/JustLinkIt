<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Search,
		Plus,
		FileBraces,
		Moon,
		Sun,
		Settings,
		Command,
		Check,
		ChevronsUpDown
	} from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { setMode } from 'mode-watcher';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { WorkspaceId } from '$lib/types';

	let {
		onExport,
		onAddLink
	}: {
		onExport: () => void;
		onAddLink: () => void;
	} = $props();

	const store = getContext<AppStore>('store');

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

	async function handleCreateWorkspace() {
		const name = prompt('Workspace name:');
		if (name && name.trim()) {
			const result = await store.workspaces.add(name.trim());
			if (result.ok && result.value.id) {
				await store.setActiveWorkspace(result.value.id);
			}
		}
	}
</script>

<header
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="flex h-14 items-center justify-between gap-4 px-4">
		<!-- Left: Logo + Workspace Selector -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-sm"
			>
				<Command class="h-4 w-4" />
			</div>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-[14px] font-semibold transition-colors hover:bg-muted"
				>
					<span class="max-w-[120px] truncate">{store.workspaces.active?.name || 'Workspace'}</span>
					<ChevronsUpDown class="h-3.5 w-3.5 text-muted-foreground" />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56 rounded-sm border p-1 shadow-lg" align="start">
					<DropdownMenu.Label
						class="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase"
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
									<span class={ws.id === store.workspaces.active?.id ? 'font-semibold' : ''}>
										{ws.name || 'Untitled'}
									</span>
								</div>
								{#if ws.id === store.workspaces.activeId}
									<Check class="h-3.5 w-3.5 text-primary" />
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Group>
					<DropdownMenu.Separator class="my-1" />
					<DropdownMenu.Item
						onclick={handleCreateWorkspace}
						class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
					>
						<Plus class="h-3.5 w-3.5" />
						<span>Create Workspace</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Center: Search -->
		<div class="mx-4 max-w-md flex-1">
			<div class="group relative">
				<Search
					class="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40"
				/>
				<Input
					value={store.filters.searchQuery}
					oninput={(e) => store.filters.setSearchQuery(e.currentTarget.value)}
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							store.filters.setSearchQuery('');
							e.currentTarget.blur();
						}
					}}
					placeholder="Search links..."
					class="h-9 w-full rounded-sm border bg-muted/20 pl-9 text-[13px] shadow-none transition-all hover:bg-muted/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center gap-1">
			<Tooltip.Root delayDuration={300}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
							onclick={toggleMode}
						>
							<div class="relative flex h-4 w-4 items-center justify-center">
								<Sun class="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
								<Moon
									class="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
								/>
							</div>
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="px-2 py-1 text-[10px]">Toggle theme</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root delayDuration={300}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
							onclick={onExport}
						>
							<FileBraces class="h-4 w-4" />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="px-2 py-1 text-[10px]">Export</Tooltip.Content>
			</Tooltip.Root>

			<Tooltip.Root delayDuration={300}>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
							href="/settings"
						>
							<Settings class="h-4 w-4" />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="bottom" class="px-2 py-1 text-[10px]">Settings</Tooltip.Content>
			</Tooltip.Root>

			<div class="mx-1 h-4 w-px bg-border"></div>

			<Button
				size="sm"
				class="h-8 gap-1.5 rounded-sm px-3 text-[12px] font-medium shadow-sm"
				onclick={onAddLink}
			>
				<Plus class="h-3.5 w-3.5" />
				<span>New</span>
			</Button>
		</div>
	</div>
</header>
