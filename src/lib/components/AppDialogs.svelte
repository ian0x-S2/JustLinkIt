<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import LinkForm from '$lib/components/LinkForm.svelte';
	import ExportDialog from '$lib/components/ExportDialog.svelte';
	import ImportDialog from '$lib/components/ImportDialog.svelte';
	import type { Link } from '$lib/types';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';

	interface Props {
		isAddDialogOpen: boolean;
		isExportDialogOpen: boolean;
		isImportDialogOpen: boolean;
		editingLink: Link | null;
		previewData: any | null;
	}

	let {
		isAddDialogOpen = $bindable(),
		isExportDialogOpen = $bindable(),
		isImportDialogOpen = $bindable(),
		editingLink = $bindable(),
		previewData = $bindable()
	}: Props = $props();

	const store = getContext<AppStore>('store');

	$effect(() => {
		if (!isAddDialogOpen) {
			editingLink = null;
			previewData = null;
		}
	});
</script>

<Dialog.Root bind:open={isAddDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 shadow-2xl lg:max-w-2xl"
	>
		<LinkForm
			link={editingLink}
			{previewData}
			onsave={() => (isAddDialogOpen = false)}
			oncancel={() => (isAddDialogOpen = false)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isExportDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 lg:max-w-md"
	>
		<ExportDialog
			bind:open={isExportDialogOpen}
			links={store.links.links.filter((l) => !l.isDeleted)}
		/>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isImportDialogOpen}>
	<Dialog.Content
		showCloseButton={false}
		class="overflow-hidden rounded-none border-2 border-foreground/30 bg-background p-0 lg:max-w-xl"
	>
		<ImportDialog bind:open={isImportDialogOpen} />
	</Dialog.Content>
</Dialog.Root>
