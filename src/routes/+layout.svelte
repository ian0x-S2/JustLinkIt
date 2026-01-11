<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarGroupLabel,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarInset,
		SidebarProvider,
		SidebarTrigger
	} from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Tag, Sparkles, Moon, Sun } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const navigation = [
		{
			label: 'Links',
			href: '/',
			icon: Tag
		},
		{
			label: 'Tags',
			href: '/tags',
			icon: Tag
		},
		{
			label: 'Suggestions',
			href: '/suggestions',
			icon: Sparkles
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: Sparkles
		},
		{
			label: 'Discovery',
			href: '/discovery',
			icon: Sparkles,
			disabled: true
		}
	];
</script>

<ModeWatcher />
<div class="flex min-h-screen w-full bg-background">
	<SidebarProvider>
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{#each navigation as item (item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton href={item.href} disabled={item.disabled}>
										<item.icon class="h-4 w-4" />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							{/each}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
		<SidebarInset class="flex-1">
			<header class="flex h-16 items-center justify-between border-b px-4">
				<SidebarTrigger />
				<Button variant="outline" size="icon" onclick={toggleMode}>
					<Moon class="h-4 w-4" />
				</Button>
			</header>
			<main class="p-4 md:p-8">
				{@render children?.()}
			</main>
		</SidebarInset>
	</SidebarProvider>
</div>
