<script lang="ts">
	import { cn } from '$lib/utils';
	import LazyStatusBar from '$lib/components/tui/LazyStatusBar.svelte';
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className,
		showStatusBar = true
	}: {
		children?: Snippet;
		class?: string;
		showStatusBar?: boolean;
	} = $props();
</script>

<div class={cn('relative flex h-full overflow-hidden border-2 border-border shadow-xs', className)}>
	{@render children?.()}

	{#if showStatusBar}
		<div class="absolute right-0 bottom-0 left-0 z-40 hidden md:flex">
			<LazyStatusBar />
		</div>
	{/if}
</div>
