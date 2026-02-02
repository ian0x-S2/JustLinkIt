<script lang="ts">
	import './layout.css';
	import { ModeWatcher, mode } from 'mode-watcher';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { setContext, untrack, type Snippet, onMount } from 'svelte';
	import { createAppStore, type AppStore } from '$lib/stores';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { pwaInfo } from 'virtual:pwa-info';

	interface Props {
		children?: Snippet;
		data: any;
	}

	let { children, data }: Props = $props();

	const themeColor = $derived(mode.current === 'dark' ? '#09090b' : '#ffffff');
	const colorScheme = $derived(mode.current === 'dark' ? 'dark' : 'light');

	$effect(() => {
		if (typeof document !== 'undefined') {
			// Update meta tags for PWA title bar
			const updateMeta = (name, value) => {
				let meta = document.querySelector(`meta[name="${name}"]`);
				if (!meta) {
					meta = document.createElement('meta');
					meta.name = name;
					document.head.appendChild(meta);
				}
				meta.setAttribute('content', value);
			};
			updateMeta('theme-color', themeColor);
			updateMeta('color-scheme', colorScheme);
		}
	});

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r) {
					console.log('SW Registered');
				},
				onRegisterError(error) {
					console.error('SW registration error', error);
				}
			});
		}
	});

	// 2. Initialize store with server data immediately to prevent empty state flicker
	const store = createAppStore({
		initialData: untrack(() => ({
			workspaces: data.workspaces,
			links: data.links,
			activeWorkspaceId: data.activeWorkspaceId,
			viewMode: data.viewMode
		}))
	});
	setContext<AppStore>('store', store);

	// 3. Sync store when data changes (e.g., on navigation)
	$effect(() => {
		store.hydrate({
			workspaces: data.workspaces,
			links: data.links,
			activeWorkspaceId: data.activeWorkspaceId,
			viewMode: data.viewMode
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

<svelte:head>
	{#if pwaInfo}
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

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
