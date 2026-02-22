<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import type { ThemeId } from '$lib/types';
	import { THEMES } from '$lib/constants';
	import { theme } from '$lib/tui';
	import { cn } from '$lib/utils';

	const store = getContext<AppStore>('store');
</script>

<section class="space-y-4">
	<div class="border-t border-border/20 pt-4">
		<h2 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
			Appearance
		</h2>
	</div>

	<div class="grid gap-1">
		{#each Object.entries(THEMES) as [key, value] (value)}
			<button
				onclick={() => store.theme.setTheme(value as unknown as ThemeId)}
				class={cn(
					theme.item,
					'group w-full px-2 py-1 text-left',
					store.theme.current === value ? 'bg-primary/10' : 'hover:bg-muted/50'
				)}
			>
				<div class="flex flex-1 items-center gap-2">
					<div
						class={cn(
							'h-3 w-3 rounded-full border border-border',
							value === 'default' ? 'bg-[#8b5cf6]' : 
							value === 'everforest' ? 'bg-[#83c092]' : 
							value === 'nord' ? 'bg-[#88c0d0]' : 'bg-muted'
						)}
					></div>
					<span
						class={cn(
							'font-bold capitalize',
							store.theme.current === value ? 'text-primary' : ''
						)}
					>
						{value}
					</span>
					{#if store.theme.current === value}
						<span class="ml-auto text-[10px] font-bold text-primary uppercase">[selected]</span>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</section>
