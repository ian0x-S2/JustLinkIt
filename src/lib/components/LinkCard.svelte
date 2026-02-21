<script lang="ts">
	import type { Link } from '$lib/types';
	import LinkCardList from './links/LinkCardList.svelte';
	import LinkCardGrid from './links/LinkCardGrid.svelte';
	import DeleteLinkDialog from './links/DeleteLinkDialog.svelte';

	interface Props {
		link: Link;
		viewMode?: 'list' | 'grid';
		onedit: (link: Link) => void;
		onToggleFavorite: (id: string) => void;
		onToggleDeleted: (id: string) => void;
		onPermanentDelete: (id: string) => void;
		onUpdateTags: (id: string, tags: string[]) => void;
	}

	let {
		link,
		viewMode = 'list',
		onedit,
		onToggleFavorite,
		onToggleDeleted,
		onPermanentDelete,
		onUpdateTags
	}: Props = $props();

	let isDeleteDialogOpen = $state(false);
</script>

{#if viewMode === 'list'}
	<LinkCardList
		{link}
		{onedit}
		{onToggleFavorite}
		{onToggleDeleted}
		onDeleteRequest={() => (isDeleteDialogOpen = true)}
	/>
{:else}
	<LinkCardGrid
		{link}
		{onedit}
		{onToggleFavorite}
		{onToggleDeleted}
		onDeleteRequest={() => (isDeleteDialogOpen = true)}
		{onUpdateTags}
	/>
{/if}

<DeleteLinkDialog
	bind:open={isDeleteDialogOpen}
	{link}
	onConfirm={() => onPermanentDelete(link.id)}
	onClose={() => (isDeleteDialogOpen = false)}
/>
