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
	<div class="flex h-11 items-center justify-between border-b border-border bg-muted/50 px-4">
		<div class="flex items-center gap-2">
			<span class="text-xs font-bold tracking-tight text-foreground uppercase">
				Export Workspace
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
		<p class="text-[12px] leading-relaxed text-muted-foreground">
			Export {links.length} links to a file. Choose a format below:
		</p>

		<div class="grid gap-2">
			<button
				class={cn(
					'group flex items-center gap-3 border border-border bg-muted/5 p-3 text-left transition-all',
					'hover:border-primary hover:bg-primary/5'
				)}
				onclick={exportToJSON}
			>
				<div
					class="flex h-8 w-8 items-center justify-center border border-border bg-background group-hover:border-primary/50"
				>
					<FileBraces class="h-4 w-4 text-muted-foreground group-hover:text-primary" />
				</div>
				<div class="flex-1">
					<p class="text-[13px] font-bold">JSON Data</p>
					<p class="text-[10px] text-muted-foreground">Best for backups and portability</p>
				</div>
				<span class="text-primary opacity-0 transition-opacity group-hover:opacity-100">
					{TUI.arrowRight}
				</span>
			</button>

			<button
				class={cn(
					'group flex items-center gap-3 border border-border bg-muted/5 p-3 text-left transition-all',
					'hover:border-primary hover:bg-primary/5'
				)}
				onclick={exportToMarkdown}
			>
				<div
					class="flex h-8 w-8 items-center justify-center border border-border bg-background group-hover:border-primary/50"
				>
					<FileText class="h-4 w-4 text-muted-foreground group-hover:text-primary" />
				</div>
				<div class="flex-1">
					<p class="text-[13px] font-bold">Markdown Doc</p>
					<p class="text-[10px] text-muted-foreground">Human-readable list of your links</p>
				</div>
				<span class="text-primary opacity-0 transition-opacity group-hover:opacity-100">
					{TUI.arrowRight}
				</span>
			</button>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
		<Button
			variant="ghost"
			onclick={() => (open = false)}
			class="h-8 rounded-none border border-border bg-background px-4 text-[11px] font-bold uppercase transition-colors hover:bg-muted"
		>
			Cancel
		</Button>
	</div>
</div>
