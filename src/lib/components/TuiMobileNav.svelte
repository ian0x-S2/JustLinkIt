<script lang="ts">
	import { cn } from '$lib/utils';
	import { theme, TUI } from '$lib/tui';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let {
		activeTab = $bindable('links')
	}: {
		activeTab: 'spaces' | 'links' | 'stats';
	} = $props();

	const tabs = [
		{ id: 'spaces', label: 'Spaces', key: '1' },
		{ id: 'links', label: 'Links', key: '2' },
		{ id: 'stats', label: 'Stats', key: '3' }
	] as const;

	async function handleTabClick(tabId: 'spaces' | 'links' | 'stats') {
		if (page.url.pathname !== '/') {
			await goto(`/?tab=${tabId}`);
		} else {
			activeTab = tabId;
		}
	}
</script>

<nav class="tui-mobile-nav">
	{#each tabs as tab}
		<button
			onclick={() => handleTabClick(tab.id)}
			class={cn(
				'flex flex-1 flex-col items-center justify-center gap-1 border-r border-border last:border-r-0',
				activeTab === tab.id && page.url.pathname === '/'
					? 'bg-primary/10 text-primary'
					: 'text-muted-foreground'
			)}
		>
			<span class="font-mono text-xs font-bold">
				{activeTab === tab.id && page.url.pathname === '/' ? TUI.arrowRight : tab.key}
			</span>
			<span class="font-mono text-xs font-bold tracking-tighter uppercase">
				{activeTab === tab.id && page.url.pathname === '/' ? `[${tab.label}]` : tab.label}
			</span>
		</button>
	{/each}
	<a
		href="/settings"
		class={cn(
			'flex flex-1 flex-col items-center justify-center gap-1 border-l border-border',
			page.url.pathname === '/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
		)}
	>
		<span class="font-mono text-xs font-bold">,</span>
		<span class="font-mono text-xs font-bold tracking-tighter uppercase">Set</span>
	</a>
</nav>

<style>
	.tui-mobile-nav {
		display: flex;
		height: 56px;
		width: 100%;
		border-top: 1px solid var(--border);
		background-color: var(--background);
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>
