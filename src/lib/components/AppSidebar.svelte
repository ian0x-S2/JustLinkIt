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
		Plus
	} from "@lucide/svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { mode, setMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button";

	const navMain = [
		{ title: "Inbox", icon: Inbox, isActive: true },
		{ title: "Favorites", icon: Star },
		{ title: "Archive", icon: Archive },
		{ title: "Trash", icon: Trash2 },
	];

	function toggleMode() {
		// Use direct access to mode store via $ if possible, 
		// but since we had issues, let's use a more direct toggle if setMode supports it
		// or just read from the document attribute as a fallback for SSR safety
		const isDark = document.documentElement.classList.contains("dark");
		setMode(isDark ? "light" : "dark");
	}
</script>

<Sidebar.Root collapsible="icon" class="border-r">
	<Sidebar.Header class="h-12 px-0 flex items-center border-b">
		<div class="flex items-center gap-2 px-4 w-full justify-start overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
			<div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shrink-0">
				<Command class="h-3.5 w-3.5" />
			</div>
			<span class="font-bold text-[13px] tracking-tight truncate group-data-[collapsible=icon]:hidden">
				Workspace
			</span>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel class="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
				Library
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navMain as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton 
								isActive={item.isActive}
								class="h-8 px-3 text-[13px] transition-colors hover:bg-muted/50 data-[active=true]:bg-muted data-[active=true]:font-medium rounded-md"
							>
								{#snippet tooltipContent()}
									{item.title}
								{/snippet}
								<item.icon class="h-4 w-4 mr-2" />
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
						class="h-8 px-3 text-[13px] text-muted-foreground hover:text-foreground rounded-md transition-colors"
					>
						<Plus class="h-4 w-4 mr-2" />
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
				class="h-8 w-full justify-start px-2 gap-2 text-[12px] font-medium text-muted-foreground hover:text-foreground rounded-md group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
				onclick={toggleMode}
			>
				<div class="relative h-4 w-4 flex items-center justify-center">
					<Sun class="h-3.5 w-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon class="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</div>
				<span class="group-data-[collapsible=icon]:hidden">Toggle Theme</span>
			</Button>

			<!-- Settings -->
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-full justify-start px-2 gap-2 text-[12px] font-medium text-muted-foreground hover:text-foreground rounded-md group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
			>
				<Settings class="h-3.5 w-3.5" />
				<span class="group-data-[collapsible=icon]:hidden">Settings</span>
			</Button>
		</div>
	</Sidebar.Footer>
</Sidebar.Root>