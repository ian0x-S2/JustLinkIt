<script lang="ts">
	import { cn } from '$lib/utils';
	import { theme } from '$lib/tui';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { page } from '$app/state';
	import DesktopLayout from './DesktopLayout.svelte';
	import MobileLayout from './MobileLayout.svelte';
	import TuiMobileNav from '$lib/components/TuiMobileNav.svelte';
	import type { Snippet } from 'svelte';

	let {
		left,
		main,
		right,
		activeMobileTab = $bindable('links'),
		singlePanel = false
	}: {
		left?: Snippet;
		main?: Snippet;
		right?: Snippet;
		activeMobileTab?: 'spaces' | 'links' | 'stats';
		singlePanel?: boolean;
	} = $props();

	const isMobile = new IsMobile(page.data.isMobileServer);
</script>

<div
	class={cn(
		theme.app,
		'relative h-[99dvh] w-screen overflow-hidden bg-background p-1 md:p-2',
		isMobile.matches && 'pb-[60px]'
	)}
>
	{#if isMobile.matches}
		<MobileLayout {singlePanel} bind:activeTab={activeMobileTab} {left} {main} {right} />
		<div class="fixed right-0 bottom-0 left-0 z-50 block">
			<TuiMobileNav bind:activeTab={activeMobileTab} />
		</div>
	{:else}
		<DesktopLayout {left} {main} {right} />
	{/if}
</div>
