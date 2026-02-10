<script lang="ts">
	import { theme } from '$lib/tui';
</script>

<div class={theme.statusBar}>
	<div class={theme.statusItem}>
		<div>
			<span class={theme.statusKey}>1-5</span>: jump to panel
		</div>
		<div>
			<span class={theme.statusKey}>esc</span>: cancel
		</div>
		<div>
			<span class={theme.statusKey}>q</span>: quit
		</div>
		<div>
			<span class={theme.statusKey}>x</span>: menu
		</div>
		<div>
			<span class={theme.statusKey}>◄ ▲ ▼ ►</span>: navigate
		</div>
	</div>
	<div class="flex items-center gap-4">
		<span class={theme.statusDonate}>Donate</span>
		<span class={theme.statusVersion}>v0.1.0</span>
	</div>
</div>
