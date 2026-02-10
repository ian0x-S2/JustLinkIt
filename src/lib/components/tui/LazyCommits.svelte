<script lang="ts">
	import { theme, LG, TUI } from '$lib/tui';

	interface Commit {
		hash: string;
		message: string;
		selected?: boolean;
	}

	interface Props {
		commits: Commit[];
		onSelect?: (hash: string) => void;
	}

	let { commits, onSelect }: Props = $props();
</script>

{#each commits as commit}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="{theme.item} {commit.selected ? theme.itemSelected : theme.itemDefault}"
		onclick={() => onSelect?.(commit.hash)}
	>
		<span class={commit.selected ? theme.commitHashSelected : theme.commitHash}>{commit.hash}</span>
		<span class={theme.commitMessage}>{commit.message}</span>
	</div>
{/each}
