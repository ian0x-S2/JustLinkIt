<script lang="ts">
	import type { Snippet } from 'svelte';
	import { theme, TUI } from '$lib/tui';

	interface Props {
		title: string;
		titleClass: string;
		children: Snippet;
		subtitle?: Snippet;
		counter?: string;
		focused?: boolean;
		class?: string;
	}

	let {
		title,
		titleClass,
		children,
		subtitle,
		counter,
		focused = false,
		class: className = ''
	}: Props = $props();
</script>

<div class="{theme.panel} {focused ? theme.panelFocus : ''} {className}">
	<!-- Title / Header -->
	<div class={theme.panelHeader}>
		<span class={titleClass}>{title}</span>
		{#if subtitle}
			<span class="text-[#6e7681]">{TUI.separator}</span>
			{@render subtitle()}
		{/if}
	</div>

	<!-- Content -->
	<div class={theme.panelContent}>
		{@render children()}
	</div>

	<!-- Border -->
	<div class="{theme.panelBorder} {focused ? theme.panelBorderFocus : ''}"></div>

	<!-- Counter / Footer -->
	{#if counter}
		<div class={theme.panelFooter}>{counter}</div>
	{/if}
</div>
