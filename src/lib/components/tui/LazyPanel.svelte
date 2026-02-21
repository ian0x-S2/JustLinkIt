<script lang="ts">
	import type { Snippet } from 'svelte';
	import { theme, TUI } from '$lib/tui';
	import { cn } from '$lib/utils';

	interface Props {
		title: string;
		titleClass: string;
		children: Snippet;
		subtitle?: Snippet;
		counter?: string;
		focused?: boolean;
		class?: string;
		contentClass?: string;
	}

	let {
		title,
		titleClass,
		children,
		subtitle,
		counter,
		focused = false,
		class: className = '',
		contentClass = ''
	}: Props = $props();
</script>

<div class="relative flex flex-col bg-background min-h-0 {focused ? theme.panelFocus : ''} {className}">
	<!-- Title / Header -->
	<div class={theme.panelHeader}>
		<span class={cn(titleClass, 'px-0.5')}>{title}</span>
		{#if subtitle}
			<span class="text-[#6e7681]">{TUI.separator}</span>
			{@render subtitle()}
		{/if}
	</div>

	<!-- Content -->
	<div class={cn(theme.panelContent, 'overflow-hidden', contentClass)}>
		{@render children()}
	</div>

	<!-- Border -->
	<div class="{theme.panelBorder} {focused ? theme.panelBorderFocus : ''}"></div>

	<!-- Counter / Footer -->
	{#if counter}
		<div class={theme.panelFooter}>{counter}</div>
	{/if}
</div>
