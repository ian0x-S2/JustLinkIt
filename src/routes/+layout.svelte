<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { setContext, untrack } from 'svelte';
	import { createAppStore, type AppStore } from '$lib/stores';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	interface Props {
		children?: import('svelte').Snippet;
		data: any;
	}

	let { children, data }: Props = $props();

	// 2. Initialize store with server data immediately to prevent empty state flicker
	const store = createAppStore({
		initialData: untrack(() => ({
			workspaces: data.workspaces,
			links: data.links,
			activeWorkspaceId: data.activeWorkspaceId
		}))
	});
	setContext<AppStore>('store', store);

	// 3. Sync store when data changes (e.g., on navigation)
	$effect(() => {
		store.hydrate({
			workspaces: data.workspaces,
			links: data.links,
			activeWorkspaceId: data.activeWorkspaceId
		});
	});

	$effect(() => {
		store.migrateFromLocalStorageIfNeeded();
	});

	let open = $state(untrack(() => data.isSidebarOpen));

	$effect(() => {
		open = data.isSidebarOpen;
	});
</script>

<ModeWatcher />

<Tooltip.Provider delayDuration={400}>
	<Sidebar.Provider bind:open>
		<div class="flex h-screen w-full overflow-hidden bg-background">
			<AppSidebar />

			<main class="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
				{@render children?.()}
			</main>
		</div>
	</Sidebar.Provider>
</Tooltip.Provider>
