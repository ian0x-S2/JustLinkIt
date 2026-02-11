<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Inbox, Star, Trash2 } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Category } from '$lib/constants';

	const store = getContext<AppStore>('store');

	const tabs = [
		{ id: 'inbox' as Category, label: 'Inbox', icon: Inbox },
		{ id: 'favorites' as Category, label: 'Favorites', icon: Star },
		{ id: 'trash' as Category, label: 'Trash', icon: Trash2 }
	] as const;

	function handleTabChange(value: string) {
		store.filters.setCategory(value as Category);
		if (page.url.pathname !== '/') {
			goto('/');
		}
	}

	const activeTab = $derived(store.filters.activeCategory);
</script>

<div
	class="sticky top-14 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<Tabs.Root value={activeTab} onValueChange={handleTabChange} class="w-full">
		<Tabs.List class="flex h-12 w-full justify-start gap-0 rounded-sm bg-transparent p-0">
			{#each tabs as tab (tab.id)}
				<Tabs.Trigger
					value={tab.id}
					class="group relative flex h-full flex-1 items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 text-[13px] font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
				>
					<tab.icon class="h-4 w-4" />
					<span class="hidden sm:inline">{tab.label}</span>
					{#if tab.id === 'inbox'}
						{@const count = store.links.links.filter((l) => !l.isDeleted).length}
						{#if count > 0}
							<span
								class="ml-1 flex h-4 min-w-4 items-center justify-center rounded-sm bg-muted px-1 text-[10px] font-medium text-muted-foreground"
							>
								{count > 99 ? '99+' : count}
							</span>
						{/if}
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>
