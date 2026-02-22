<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import LazyPanel from '$lib/components/tui/LazyPanel.svelte';
	import { theme } from '$lib/tui';
	import type { Link } from '$lib/types';
	import { AppLayout } from '$lib/components/layout';
	import AppDialogs from '$lib/components/AppDialogs.svelte';
	import WorkspaceSettingsSection from '$lib/components/settings/WorkspaceSettingsSection.svelte';
	import ThemeSettingsSection from '$lib/components/settings/ThemeSettingsSection.svelte';
	import SystemSettingsSection from '$lib/components/settings/SystemSettingsSection.svelte';

	const store = getContext<AppStore>('store');

	let isAddDialogOpen = $state(false);
	let isExportDialogOpen = $state(false);
	let isImportDialogOpen = $state(false);
	let editingLink = $state<Link | null>(null);
	let previewData = $state<any>(null);

	function handleAddLink() {
		editingLink = null;
		isAddDialogOpen = true;
	}
</script>

<AppLayout singlePanel={true}>
	{#snippet left()}
		<LeftSidebar
			onAddLink={handleAddLink}
			onExport={() => (isExportDialogOpen = true)}
			onImport={() => (isImportDialogOpen = true)}
		/>
	{/snippet}

	{#snippet main()}
		<LazyPanel
			title="Settings"
			titleClass={theme.titleBranches}
			focused={true}
			class="flex-1"
			counter="Workspace Management"
		>
			{#snippet subtitle()}
				<div class="ml-2 flex items-center gap-2">
					<a
						href="/"
						class="text-[10px] font-bold text-muted-foreground uppercase hover:text-foreground"
					>
						[b]ack to home
					</a>
				</div>
			{/snippet}

			<div class="mt-1 min-h-0 flex-1 overflow-hidden">
				<ScrollArea type="hover" class="h-full w-full">
					<div class="flex min-h-full flex-col justify-between space-y-6 p-2 pb-10">
						<div>
							<WorkspaceSettingsSection />
							<ThemeSettingsSection />
							<SystemSettingsSection />
						</div>

						<div class="border-t border-border/20 pt-6 text-center">
							<p class="text-[11px] text-muted-foreground">
								© 2026 LinkIt • Local-First Bookmark Manager
							</p>
						</div>
					</div>
				</ScrollArea>
			</div>
		</LazyPanel>
	{/snippet}

	{#snippet right()}
		<RightSidebar />
	{/snippet}
</AppLayout>

<AppDialogs
	bind:isAddDialogOpen
	bind:isExportDialogOpen
	bind:isImportDialogOpen
	bind:editingLink
	bind:previewData
/>
