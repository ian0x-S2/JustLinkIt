<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<!-- Header Section: Fixed h-12 to match Sidebar/Workspace Header -->
<div class="flex h-12 items-center border-b bg-background/80 px-4 backdrop-blur-md">
	<Button variant="ghost" size="icon" href="/" class="mr-2 h-7 w-7 rounded-md">
		<ArrowLeft class="h-3.5 w-3.5" />
	</Button>
	<h1 class="text-[13px] font-semibold tracking-tight">Settings</h1>
</div>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<!-- Section: About / Info -->
	<section class="space-y-3 px-1">
		<h3 class="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">System</h3>
		<div class="flex items-center justify-between py-1">
			<div class="space-y-0.5">
				<p class="text-[12.5px] font-medium">Data Storage</p>
				<p class="text-[11px] text-muted-foreground/60">Local (Browser Storage)</p>
			</div>
			<Badge
				variant="outline"
				class="h-4.5 rounded-[4px] px-1.5 text-[9px] font-bold tracking-tighter uppercase"
				>Healthy</Badge
			>
		</div>
	</section>

	<!-- Footer Actions -->
	<div class="flex justify-end gap-2 pt-6">
		<Button variant="ghost" href="/" class="h-8 rounded-md px-4 text-[12.5px]">Back</Button>
	</div>
</div>
