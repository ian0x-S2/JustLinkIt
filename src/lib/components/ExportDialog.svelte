<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileBraces,  FileText } from '@lucide/svelte';
	import type { Link } from '$lib/types';

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

<div class="flex flex-col gap-6 p-1">
	<div class="space-y-1.5">
		<h2 class="text-[14px] font-semibold tracking-tight">Export Workspace</h2>
		<p class="text-[12.5px] leading-relaxed text-muted-foreground/70">
			Download your collection as a portable file. Your data stays private and local.
		</p>
	</div>

	<div class="grid gap-3">
		<button
			class="group flex items-center justify-between rounded-sm border bg-muted/20 p-3 transition-all hover:border-primary/20 hover:bg-muted/40"
			onclick={exportToJSON}
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-sm border bg-background shadow-sm transition-colors group-hover:border-primary/20"
				>
					<FileBraces
						class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
					/>
				</div>
				<div class="text-left">
					<p class="text-[13px] leading-none font-medium">JSON Data</p>
					<p class="mt-1 text-[11px] text-muted-foreground/60">
						Best for backups and machine reading.
					</p>
				</div>
			</div>
		</button>

		<button
			class="group flex items-center justify-between rounded-sm border bg-muted/20 p-3 transition-all hover:border-primary/20 hover:bg-muted/40"
			onclick={exportToMarkdown}
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-sm border bg-background shadow-sm transition-colors group-hover:border-primary/20"
				>
					<FileText
						class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
					/>
				</div>
				<div class="text-left">
					<p class="text-[13px] leading-none font-medium">Markdown Document</p>
					<p class="mt-1 text-[11px] text-muted-foreground/60">
						Best for reading and documentation.
					</p>
				</div>
			</div>
		</button>
	</div>

	<div class="flex justify-end gap-2 pt-2">
		<Button
			variant="ghost"
			class="h-8 rounded-sm px-4 text-[12.5px]"
			onclick={() => (open = false)}
		>
			Cancel
		</Button>
	</div>
</div>
