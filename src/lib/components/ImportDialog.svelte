<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { FileBraces, X, Loader2, CheckCircle2, AlertCircle } from '@lucide/svelte';
	import { getContext } from 'svelte';
	import type { AppStore } from '$lib/stores';
	import { cn } from '$lib/utils';
	import { TUI } from '$lib/tui';

	let { open = $bindable(false) }: { open: boolean } = $props();
	const store = getContext<AppStore>('store');

	let fileInput: HTMLInputElement;
	let isImporting = $state(false);
	let error = $state<string | null>(null);
	let success = $state(false);
	let importIntoCurrent = $state(true);
	let stats = $state({ imported: 0, skipped: 0, workspaces: 0 });

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		error = null;
		success = false;
		isImporting = true;

		try {
			const text = await file.text();
			const data = JSON.parse(text);

			let links = [];
			let workspaces = [];

			if (Array.isArray(data)) {
				links = data;
			} else if (data.links || data.workspaces) {
				links = data.links || [];
				workspaces = data.workspaces || [];
			} else {
				throw new Error('Invalid JSON format. Expected an array of links or a migration object.');
			}

			if (importIntoCurrent && store.workspaces.activeId) {
				links = links.map((l: any) => ({
					...l,
					workspaceId: store.workspaces.activeId,
					id: crypto.randomUUID()
				}));
			}

			const result = await store.repository.migrate({ links, workspaces });

			if (result.ok) {
				const responseData = result.value as any;
				if (responseData.stats) {
					stats = responseData.stats;
				} else {
					stats = { imported: links.length, skipped: 0, workspaces: workspaces.length };
				}

				success = true;
				if (store.workspaces.activeId) {
					await store.links.fetchForWorkspace(store.workspaces.activeId);
				}
			} else {
				throw new Error(result.error.message);
			}
		} catch (err: any) {
			error = err.message || 'Failed to import file';
		} finally {
			isImporting = false;
			if (fileInput) fileInput.value = '';
		}
	}

	function triggerFileSelect() {
		fileInput?.click();
	}
</script>

<div class="flex flex-col bg-background font-mono text-foreground">
	<!-- Header -->
	<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
		<div class="flex items-center gap-2">
			<span class="text-xs font-bold tracking-tight text-foreground uppercase">
				Import Data
			</span>
		</div>
		<div class="flex items-center gap-3 text-xs">
			<div class="flex items-center gap-1 text-muted-foreground">
				<span class="border border-border bg-muted px-1 py-0 text-xs font-bold text-foreground uppercase"
					>esc</span
				>
				<span>close</span>
			</div>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (open = false)}
				class="h-7 w-7 rounded-none border border-transparent hover:border-border hover:bg-muted"
			>
				<X class="h-4 w-4" />
			</Button>
		</div>
	</div>

	<!-- Body -->
	<div class="flex-1 space-y-4 p-6">
		{#if !success && !error}
			<div class="space-y-5">
				<p class="text-[12px] leading-relaxed text-muted-foreground italic">
					{TUI.bullet} Select a JSON file to restore your links.
				</p>

				<div class="flex items-center gap-3 border border-border/40 bg-muted/5 p-3">
					<Checkbox
						id="import-current"
						bind:checked={importIntoCurrent}
						class="rounded-none border-border"
					/>
					<Label
						for="import-current"
						class="flex-1 cursor-pointer text-[11px] leading-none font-medium text-foreground select-none"
					>
						Import into <span class="font-bold text-primary">[{store.workspaces.active.name}]</span>
					</Label>
				</div>
			</div>
		{/if}

		<input
			type="file"
			accept=".json"
			bind:this={fileInput}
			onchange={handleFileSelect}
			class="hidden"
		/>

		<div class="grid gap-4 pt-2">
			{#if success}
				<div class="flex flex-col items-center justify-center space-y-3 py-4 text-center">
					<div
						class="flex h-12 w-12 items-center justify-center border border-primary bg-primary/5"
					>
						<CheckCircle2 class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-[14px] font-bold tracking-tight text-foreground uppercase">
							Import Successful!
						</p>
						<div class="mt-2 flex flex-col gap-1">
							<p class="text-[11px] text-muted-foreground">
								<span class="font-bold text-primary">+{stats.imported}</span> links imported.
							</p>
							{#if stats.skipped > 0}
								<p class="text-[11px] text-muted-foreground">
									<span class="font-bold text-destructive">{stats.skipped}</span> duplicates skipped.
								</p>
							{/if}
							{#if stats.workspaces > 0}
								<p class="text-[11px] text-muted-foreground">
									<span class="font-bold text-primary">+{stats.workspaces}</span> workspaces created.
								</p>
							{/if}
						</div>
					</div>
					<div class="flex gap-2 pt-2">
						<Button
							variant="outline"
							onclick={() => (open = false)}
							class="h-8 rounded-none border-border bg-background px-4 text-[11px] font-bold uppercase"
						>
							Done
						</Button>
						<Button
							onclick={() => window.location.reload()}
							class="h-8 rounded-none border-primary bg-primary px-4 text-[11px] font-bold text-primary-foreground uppercase shadow-sm active:scale-95"
						>
							Reload App
						</Button>
					</div>
				</div>
			{:else if error}
				<div
					class="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-3 text-destructive"
				>
					<AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
					<div class="flex-1">
						<p class="text-[12px] font-bold uppercase">Import Error</p>
						<p class="text-[11px] opacity-90">{error}</p>
					</div>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => (error = null)}
						class="h-6 w-6 text-destructive hover:bg-destructive/10"
					>
						<X class="h-3.5 w-3.5" />
					</Button>
				</div>
				<Button
					variant="outline"
					onclick={triggerFileSelect}
					class={cn(
						'group flex h-auto items-center justify-start gap-3 rounded-none border border-border bg-muted/5 p-3 text-left transition-all',
						'hover:border-primary hover:bg-primary/5 hover:text-foreground'
					)}
				>
					<div
						class="flex h-8 w-8 items-center justify-center border border-border bg-background group-hover:border-primary/50"
					>
						<FileBraces class="h-4 w-4 text-muted-foreground group-hover:text-primary" />
					</div>
					<div class="flex-1 overflow-hidden">
						<p class="text-[13px] font-bold">Try Again</p>
						<p class="truncate text-[10px] font-normal text-muted-foreground">
							Select another JSON file
						</p>
					</div>
					<span class="text-primary opacity-0 transition-opacity group-hover:opacity-100">
						{TUI.arrowRight}
					</span>
				</Button>
			{:else}
				<Button
					variant="outline"
					onclick={triggerFileSelect}
					disabled={isImporting}
					class={cn(
						'group flex h-auto items-center justify-start gap-3 rounded-none border border-border bg-muted/5 p-4 text-left transition-all',
						'hover:border-primary hover:bg-primary/5 hover:text-foreground',
						isImporting && 'pointer-events-none opacity-50'
					)}
				>
					<div
						class="flex h-10 w-10 items-center justify-center border border-border bg-background group-hover:border-primary/50"
					>
						{#if isImporting}
							<Loader2 class="h-5 w-5 animate-spin text-primary" />
						{:else}
							<FileBraces class="h-5 w-5 text-muted-foreground group-hover:text-primary" />
						{/if}
					</div>
					<div class="flex-1 overflow-hidden">
						<p class="text-[14px] font-bold tracking-tight uppercase">Choose JSON File</p>
						<p class="truncate text-[11px] font-normal text-muted-foreground">
							Browse local filesystem for backup
						</p>
					</div>
					<span class="text-primary opacity-0 transition-opacity group-hover:opacity-100">
						{TUI.arrowRight}
					</span>
				</Button>
			{/if}
		</div>
	</div>

	<!-- Footer -->
	{#if !success}
		<div class="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
			<Button
				variant="ghost"
				onclick={() => (open = false)}
				class="h-8 rounded-none border border-border bg-background px-4 text-[11px] font-bold uppercase transition-colors hover:bg-muted"
			>
				Cancel
			</Button>
		</div>
	{/if}
</div>
