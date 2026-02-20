<script lang="ts">
	import { cn } from '$lib/utils';
	import { theme } from '$lib/tui';
	import AppShell from './AppShell.svelte';
	import type { Snippet } from 'svelte';

	let {
		left,
		main,
		right,
		activeTab = $bindable('links'),
		singlePanel = false
	}: {
		left?: Snippet;
		main?: Snippet;
		right?: Snippet;
		activeTab?: 'spaces' | 'links' | 'stats';
		singlePanel?: boolean;
	} = $props();
</script>

<AppShell showStatusBar={false}>
	<div class="flex h-full w-full gap-0 overflow-hidden px-1.5 pt-3">
		{#if singlePanel && main}
			<main class={cn(theme.layoutContent, 'flex h-full w-full min-w-0 flex-1 flex-col')}>
				{@render main()}
			</main>
		{:else if activeTab === 'spaces' && left}
			<aside class="flex h-full w-full min-w-0 flex-col overflow-y-auto p-2 px-1">
				{@render left()}
			</aside>
		{:else if activeTab === 'links' && main}
			<main class={cn(theme.layoutContent, 'flex h-full w-full min-w-0 flex-1 flex-col')}>
				{@render main()}
			</main>
		{:else if activeTab === 'stats' && right}
			<aside class="flex h-full w-full min-w-0 flex-col overflow-y-auto p-2 px-1">
				{@render right()}
			</aside>
		{/if}
	</div>
</AppShell>
