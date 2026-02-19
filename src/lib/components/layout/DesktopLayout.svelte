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
	<div class="flex h-full w-full gap-2 overflow-hidden p-1 pb-6 lg:gap-4 lg:p-4 lg:pb-8">
		{#if left}
			<aside
				class="flex h-full w-[240px] min-w-0 shrink-0 flex-col overflow-y-auto p-2 lg:w-[300px]"
			>
				{@render left()}
			</aside>
		{/if}

		{#if main}
			<main class={cn(theme.layoutContent, 'flex h-full min-w-0 flex-1 flex-col')}>
				{@render main()}
			</main>
		{/if}

		{#if right}
			<aside
				class="hidden h-full w-[260px] min-w-0 shrink-0 flex-col overflow-y-auto p-2 lg:flex xl:w-[300px]"
			>
				{@render right()}
			</aside>
		{/if}
	</div>
</AppShell>
