<script lang="ts">
	import { Database, Info } from '@lucide/svelte';
</script>

<section class="space-y-4">
	<div class="border-t border-border/20 pt-4">
		<h3 class="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">System</h3>
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between px-2 py-1">
			<div class="flex items-center gap-2">
				<Database class="h-3.5 w-3.5 text-muted-foreground" />
				<span class="text-[13px]">Data Persistence</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-[11px] text-muted-foreground">SQLite</span>
				<span class="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
					Connected
				</span>
			</div>
		</div>

		<div class="flex items-center justify-between px-2 py-1">
			<div class="flex items-center gap-2">
				<Info class="h-3.5 w-3.5 text-muted-foreground" />
				<span class="text-[13px]">App Version</span>
			</div>
			<span class="font-mono text-[11px] text-primary">v1.0.0-mvp</span>
		</div>
	</div>
</section>
