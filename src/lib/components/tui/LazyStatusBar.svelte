<script lang="ts">
	import { theme } from '$lib/tui';
	import { cn } from '$lib/utils';
</script>

<div class={theme.statusBar}>
	<div class={theme.statusItem}>
		<div class="hidden sm:block">
			<span class={theme.statusKey}>1-5</span>: jump
		</div>
		<div class="hidden sm:block">
			<span class={theme.statusKey}>esc</span>: cancel
		</div>
		<div class="xs:block hidden">
			<span class={theme.statusKey}>q</span>: quit
		</div>
		<div>
			<span class={theme.statusKey}>x</span>: menu
		</div>
		<div class="hidden md:block">
			<span class={theme.statusKey}>◄ ▲ ▼ ►</span>: navigate
		</div>
	</div>
	<div class="flex items-center gap-2 sm:gap-4">
		<span class={cn(theme.statusDonate, 'xs:inline hidden')}>Donate</span>
		<span class={theme.statusVersion}>v0.1.0</span>
	</div>
</div>
