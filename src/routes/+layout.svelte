<script lang="ts">
	import './layout.css';
	import { ModeWatcher, mode } from 'mode-watcher';
	import { setContext, untrack, type Snippet, onMount } from 'svelte';
	import { createAppStore, type AppStore } from '$lib/stores';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { pwaInfo } from 'virtual:pwa-info';

	import { STORAGE_KEYS, getPwaThemeColor } from '$lib/constants';
	import type { LayoutData } from './$types';
	import type { Link, Workspace, WorkspaceId, ThemeId } from '$lib/types';

	interface Props {
		children?: Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();
	let mounted = $state(false);

	const store = createAppStore({
		initialData: untrack(() => ({
			workspaces: data.workspaces as Workspace[],
			links: data.links as Link[],
			activeWorkspaceId: data.activeWorkspaceId as WorkspaceId,
			viewMode: data.viewMode,
			theme: data.theme as ThemeId
		}))
	});
	setContext<AppStore>('store', store);

	const themeColor = $derived(getPwaThemeColor(store.theme.current, mode.current === 'dark'));
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

	$effect(() => {
		if (mounted) {
			untrack(() => {
				store.hydrate({
					workspaces: data.workspaces as Workspace[],
					links: data.links as Link[],
					activeWorkspaceId: data.activeWorkspaceId as WorkspaceId,
					viewMode: data.viewMode,
					theme: data.theme as ThemeId
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
