<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { setContext, untrack } from 'svelte'; // 1. Import untrack
	import { LinkStore } from '$lib/store.svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: any;
	}

	let { children, data }: Props = $props();

	// 2. Wrap data in untrack() to tell Svelte
	// "I know this only runs once at initialization"
	const store = new LinkStore(untrack(() => data));
	setContext('store', store);

	// 3. Use an effect to sync the store when data changes (e.g., on navigation)
	$effect(() => {
		store.hydrate(data);
	});

	$effect(() => {
		store.maybeMigrate();
	});

	let open = $state(untrack(() => data.isSidebarOpen));

	$effect(() => {
		open = data.isSidebarOpen;
	});
</script>

<ModeWatcher />

<Sidebar.Provider bind:open>
	<div class="flex h-screen w-full overflow-hidden bg-background">
		<AppSidebar />

		<main class="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
			{@render children?.()}
		</main>
	</div>
</Sidebar.Provider>
