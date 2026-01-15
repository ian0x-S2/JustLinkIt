<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { search, selectedTags } from '$lib/store.svelte';

	let { onAdd }: { onAdd: () => void } = $props();
</script>

<div class="flex flex-col items-center justify-center p-12 text-center">
	<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30">
		<Search class="h-8 w-8 text-muted-foreground/40" />
	</div>
	<h3 class="text-base font-semibold text-foreground">No links found</h3>
	<p class="mt-1.5 text-sm text-muted-foreground max-w-[240px]">
		{#if (search?.query) || (selectedTags?.length > 0)}
			Try adjusting your search or filters to find what you're looking for.
		{:else}
			Your library is empty. Add your first link to start building your workspace.
		{/if}
	</p>
	
	{#if !(search?.query) && !(selectedTags?.length > 0)}
		<button 
			onclick={onAdd}
			class="mt-6 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
		>
			Add your first link
		</button>
	{/if}
</div>