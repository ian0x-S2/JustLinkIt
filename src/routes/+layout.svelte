<script lang="ts">
	import './layout.css';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { setContext, untrack, type Snippet, onMount } from 'svelte';
	import { createAppStore, type AppStore } from '$lib/stores';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { pwaInfo } from 'virtual:pwa-info';

	import { STORAGE_KEYS } from '$lib/constants';

	interface Props {
		children?: Snippet;
		data: any;
	}

	let { children, data }: Props = $props();
	let mounted = $state(false);

	const themeColor = $derived(mode.current === 'dark' ? '#09090b' : '#ffffff');
	const colorScheme = $derived(mode.current === 'dark' ? 'dark' : 'light');

	$effect(() => {
		if (typeof document !== 'undefined') {
			const updateMeta = (name: string, value: string) => {
				let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
				if (!meta) {
					meta = document.createElement('meta') as HTMLMetaElement;
					meta.name = name;
					document.head.appendChild(meta);
				}
				meta.content = value;
			};
			updateMeta('theme-color', themeColor);
			updateMeta('color-scheme', colorScheme);
		}
	});

	onMount(async () => {
		mounted = true;
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

	const store = createAppStore({
		initialData: untrack(() => ({
			workspaces: data.workspaces,
			links: data.links,
			activeWorkspaceId: data.activeWorkspaceId,
			viewMode: data.viewMode,
			theme: data.theme
		}))
	});
	setContext<AppStore>('store', store);

$effect(() => {
		// Only run hydration logic if data actually changes after initial mount
		if (mounted) {
			untrack(() => {
				store.hydrate({
					workspaces: data.workspaces,
					links: data.links,
					activeWorkspaceId: data.activeWorkspaceId,
					viewMode: data.viewMode,
					theme: data.theme
				});
			});
		}
	});

	$effect(() => {
		store.migrateFromLocalStorageIfNeeded();
	});
</script>

<svelte:head>
	{#if pwaInfo}
		{@html pwaInfo.webManifest.linkTag}
	{/if}
</svelte:head>

<ModeWatcher themeStorageKey={STORAGE_KEYS.THEME} />

<Tooltip.Provider delayDuration={400}>
	<div class="flex h-[100dvh] w-full overflow-hidden bg-background">
		{@render children?.()}
	</div>
</Tooltip.Provider>
