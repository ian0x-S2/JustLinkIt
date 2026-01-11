<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import {
		Sidebar,
		SidebarContent,
		SidebarGroup,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuButton,
		SidebarMenuItem,
		SidebarProvider,
		SidebarTrigger,
		SidebarFooter
	} from '$lib/components/ui/sidebar';
	import { Button } from '$lib/components/ui/button';
	import { Home, Hash, Sparkles, Settings, Search, Moon, Sun, Link as LinkIcon } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { page } from '$app/state';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	const navigation = [
		{
			label: 'Home',
			href: '/',
			icon: Home
		},
		{
			label: 'Discovery',
			href: '/discovery',
			icon: Search,
			disabled: true
		},
		{
			label: 'Tags',
			href: '/tags',
			icon: Hash
		},
		{
			label: 'Suggestions',
			href: '/suggestions',
			icon: Sparkles
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: Settings
		}
	];
</script>

<ModeWatcher />
<div class="flex min-h-screen w-full bg-background">
	<SidebarProvider>
		<Sidebar collapsible="icon" class="border-r bg-background">
			<SidebarContent class="bg-background">
				<SidebarGroup>
					<div class="px-2 py-3 flex items-center justify-between overflow-hidden h-14">
						<div class="flex items-center gap-2 px-2 min-w-0 group-data-[collapsible=icon]:hidden">
							<a href="/" class="flex items-center gap-2">
								<div
									class="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground shrink-0"
								>
									<LinkIcon class="h-4 w-4" />
								</div>
								<span class="font-bold text-base tracking-tight truncate">MyLinks</span>
							</a>
						</div>
						<div
							class="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
						>
							<SidebarTrigger />
						</div>
					</div>

					<SidebarGroupContent>
						<SidebarMenu>
							{#each navigation as item (item.href)}
								<SidebarMenuItem>
									<SidebarMenuButton
										href={item.href}
										disabled={item.disabled}
										isActive={page.url.pathname === item.href}
										tooltip={item.label}
										class="py-5"
									>
										<item.icon class="h-5 w-5" />
										<span class="text-base">{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							{/each}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter class="p-2 gap-1 bg-background border-t">
				<Button
					variant="ghost"
					size="icon"
					class="w-full justify-start gap-2 px-2 h-9 group-data-[collapsible=icon]:justify-center"
					onclick={toggleMode}
				>
					<Moon class="h-4 w-4 dark:hidden" />
					<Sun class="h-4 w-4 hidden dark:block" />
					<span class="group-data-[collapsible=icon]:hidden text-xs font-medium">Theme</span>
				</Button>
			</SidebarFooter>
		</Sidebar>

		<div class="flex-1 flex justify-center bg-muted/5">
			<main class="w-full max-w-2xl min-h-screen bg-background border-x relative shadow-sm">
				{@render children?.()}
			</main>

			<!-- Right Column (Trends/Discovery) - Hidden on smaller screens -->
			<aside class="hidden lg:block w-[400px] pl-12 pr-8 py-6 sticky top-0 h-screen overflow-y-auto">
				<div class="bg-background rounded-2xl p-5 border shadow-sm space-y-4">
					<h2 class="font-bold px-2 text-lg tracking-tight">What's happening</h2>
					<div class="space-y-5">
						<div class="px-2 py-1 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
							<p class="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
								Trending in Tech
							</p>
							<p class="font-bold text-[15px] group-hover:text-primary transition-colors">#Svelte5</p>
							<p class="text-[11px] text-muted-foreground">1,234 links</p>
						</div>
						<div class="px-2 py-1 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group">
							<p class="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
								Local-first Apps
							</p>
							<p class="font-bold text-[15px] group-hover:text-primary transition-colors">
								#BunRuntime
							</p>
							<p class="text-[11px] text-muted-foreground">856 links</p>
						</div>
					</div>
					<Button variant="link" class="text-sm text-primary p-2 h-auto font-medium">Show more</Button>
				</div>
			</aside>
		</div>
	</SidebarProvider>
</div>
