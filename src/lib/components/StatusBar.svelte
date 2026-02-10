<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { TUI } from '$lib/tui';

	const store = getContext<AppStore>('store');

	const stats = $derived(() => {
		const total = store.links.links.filter((l) => !l.isDeleted).length;
		const favorites = store.links.links.filter((l) => l.isFavorite && !l.isDeleted).length;
		const archived = store.links.links.filter((l) => l.isArchived && !l.isDeleted).length;
		return { total, favorites, archived };
	});

	let currentTime = $state(new Date());

	// Update time every minute
	$effect(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 60000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex h-6 items-center justify-between bg-muted px-2 text-[11px] font-medium">
	<!-- Left section -->
	<div class="flex items-center gap-3">
		<span class="text-primary">linkfeed</span>
		<span class="text-muted-foreground">{TUI.separator}</span>
		<span class="text-muted-foreground">
			{stats().total} links
		</span>
		<span class="text-muted-foreground">{TUI.separator}</span>
		<span class="text-yellow-500">{stats().favorites} favorites</span>
	</div>

	<!-- Center section - Keybindings -->
	<div class="hidden items-center gap-2 md:flex">
		<span class="text-muted-foreground">
			<span class="rounded bg-secondary px-1 text-secondary-foreground">a</span> add
		</span>
		<span class="text-muted-foreground">
			<span class="rounded bg-secondary px-1 text-secondary-foreground">/</span> search
		</span>
		<span class="text-muted-foreground">
			<span class="rounded bg-secondary px-1 text-secondary-foreground">?</span> help
		</span>
	</div>

	<!-- Right section -->
	<div class="flex items-center gap-3">
		<span class="text-muted-foreground">{TUI.separator}</span>
		<span class="text-muted-foreground">
			{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
		</span>
	</div>
</div>
