<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "$lib/components/AppSidebar.svelte";

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	let open = $state(true);
	let headerElement = $state<HTMLElement | null>(null);
	let headerHeight = $state(0);

	$effect(() => {
		if (headerElement) {
			const observer = new ResizeObserver((entries) => {
				for (let entry of entries) {
					headerHeight = entry.target.clientHeight;
				}
			});
			observer.observe(headerElement);
			return () => observer.disconnect();
		}
	});
</script>

<ModeWatcher />

<Sidebar.Provider bind:open>
	<div class="flex h-screen w-full overflow-hidden bg-background">
		<AppSidebar />
		
		<main class="flex-1 min-w-0 flex flex-col h-screen overflow-hidden relative">
			<!-- O Header será injetado aqui pelo +page.svelte via snippet ou renderizado diretamente se movermos a lógica -->
			{@render children?.()}
		</main>
	</div>
</Sidebar.Provider>