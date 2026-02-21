<script lang="ts">
	import { cn } from '$lib/utils';
	import { theme } from '$lib/tui';
	import AppShell from './AppShell.svelte';
	import type { Snippet } from 'svelte';

	let {
		left,
		main,
		right
	}: {
		left?: Snippet;
		main?: Snippet;
		right?: Snippet;
	} = $props();
</script>

<AppShell>
	<div class="flex h-full w-full gap-2 overflow-hidden p-2 pb-6">
		{#if left}
			<aside class={cn(theme.sidebar, 'h-full min-w-0 flex-col overflow-y-auto')}>
				{@render left()}
			</aside>
		{/if}

		{#if main}
			<main class={cn(theme.layoutContent, 'flex h-full min-w-0 flex-1 flex-col')}>
				{@render main()}
			</main>
		{/if}

		{#if right}
			<aside class={cn(theme.sidebar, 'hidden h-full min-w-0 flex-col overflow-y-auto lg:flex')}>
				{@render right()}
			</aside>
		{/if}
	</div>
</AppShell>
