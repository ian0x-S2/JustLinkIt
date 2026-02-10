<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileBraces, FileText, X } from '@lucide/svelte';
	import type { Link } from '$lib/types';
	import { cn } from '$lib/utils.js';
	import { TUI } from '$lib/tui';

	let { open = $bindable(false), links }: { open: boolean; links: Link[] } = $props();

	async function exportToJSON() {
		const data = JSON.stringify(links, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
		open = false;
	}

	async function exportToMarkdown() {
		let markdown = '# Links Export\n\n';
		links.forEach((link) => {
			markdown += `## ${link.title || link.url}\n\n`;
			markdown += `${link.url}\n\n`;
			if (link.description) {
				markdown += `${link.description}\n\n`;
			}
			if (link.tags.length > 0) {
				markdown += `Tags: ${link.tags.join(', ')}\n\n`;
			}
			markdown += '---\n\n';
		});
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `links-export-${Date.now()}.md`;
		a.click();
		URL.revokeObjectURL(url);
		open = false;
	}
</script>

<div class="flex flex-col bg-background text-foreground">
	<!-- Header - Lazygit style -->
	<div class="flex h-8 items-center justify-between border-b border-border bg-muted px-3">
		<span
			class="flex items-center gap-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
		>
			<span>{TUI.topLeft}</span>
			<span>Export Workspace</span>
		</span>
		<div class="flex items-center gap-3 text-[10px] text-muted-foreground">
			<span>
				<span class="rounded bg-secondary px-1 text-secondary-foreground">esc</span> close
			</span>
			<Button
				variant="ghost"
				size="icon"
				onclick={() => (open = false)}
				class="h-6 w-6 text-muted-foreground hover:bg-muted hover:text-foreground"
			>
				<X class="h-3 w-3" />
			</Button>
		</div>
	</div>

	<!-- Body -->
	<div class="flex-1 space-y-3 px-3 py-3">
		<p class="text-[11px] leading-relaxed text-muted-foreground">
			Export {links.length} links to a file.
		</p>

		<div class="grid gap-2">
			<button
				class={cn(
					'group flex items-center gap-2 border-2 border-border bg-muted/10 p-2',
					'hover:border-primary/50 hover:bg-muted/20'
				)}
				onclick={exportToJSON}
			>
				<div
					class="flex h-7 w-7 items-center justify-center border border-border bg-background group-hover:border-primary/30"
				>
					<FileBraces class="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
				</div>
				<div class="text-left">
					<p class="text-[12px] font-medium">JSON Data</p>
					<p class="text-[10px] text-muted-foreground">Best for backups</p>
				</div>
				<span class="ml-auto text-[10px] text-muted-foreground">
					{TUI.arrowRight}
				</span>
			</button>

			<button
				class={cn(
					'group flex items-center gap-2 border-2 border-border bg-muted/10 p-2',
					'hover:border-primary/50 hover:bg-muted/20'
				)}
				onclick={exportToMarkdown}
			>
				<div
					class="flex h-7 w-7 items-center justify-center border border-border bg-background group-hover:border-primary/30"
				>
					<FileText class="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
				</div>
				<div class="text-left">
					<p class="text-[12px] font-medium">Markdown Doc</p>
					<p class="text-[10px] text-muted-foreground">Best for reading</p>
				</div>
				<span class="ml-auto text-[10px] text-muted-foreground">
					{TUI.arrowRight}
				</span>
			</button>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
		<Button
			variant="ghost"
			onclick={() => (open = false)}
			class="h-7 px-3 text-[11px] font-medium text-muted-foreground hover:text-foreground"
		>
			<span class="mr-1 rounded bg-secondary px-1 text-secondary-foreground">esc</span>
			Cancel
		</Button>
	</div>
</div>
