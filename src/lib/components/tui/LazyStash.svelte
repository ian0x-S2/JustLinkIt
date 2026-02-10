<script lang="ts">
	import { theme, LG } from '$lib/tui';

	interface Stash {
		id: string;
		message: string;
		selected?: boolean;
	}

	interface Props {
		stashes: Stash[];
		onSelect?: (id: string) => void;
	}

	let { stashes, onSelect }: Props = $props();
</script>

{#each stashes as stash}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="{theme.item} {stash.selected ? theme.itemSelected : theme.itemDefault}"
		onclick={() => onSelect?.(stash.id)}
	>
		{stash.message}
	</div>
{/each}
