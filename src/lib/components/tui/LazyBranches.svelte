<script lang="ts">
	import { theme, LG, TUI, formatBranchStatus, formatRelativeTime } from '$lib/tui';

	interface Branch {
		name: string;
		time: Date;
		ahead: number;
		behind: number;
		current?: boolean;
	}

	interface Props {
		branches: Branch[];
		selectedId?: string;
		onSelect?: (name: string) => void;
	}

	let { branches, selectedId, onSelect }: Props = $props();
</script>

{#each branches as branch}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="{theme.branchItem} {selectedId === branch.name ? theme.itemSelected : theme.itemDefault}"
		onclick={() => onSelect?.(branch.name)}
	>
		{#if branch.current}
			<span class="text-[#4ec9b0]">{TUI.bullet}</span>
		{:else}
			<span class="w-4"></span>
		{/if}
		<span class={theme.branchTime}>{formatRelativeTime(branch.time)}</span>
		<span class="{theme.branchName} {branch.current ? theme.itemCurrent : ''}">{branch.name}</span>
		{#if branch.ahead > 0 || branch.behind > 0}
			<span class={theme.branchArrows}>
				{#if branch.ahead > 0}
					<span style="color: {LG.arrowUp}">{TUI.arrowUp}{branch.ahead}</span>
				{/if}
				{#if branch.behind > 0}
					<span style="color: {LG.arrowDown}">{TUI.arrowDown}{branch.behind}</span>
				{/if}
			</span>
		{/if}
	</div>
{/each}
