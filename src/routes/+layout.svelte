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
	import {
		Home,
		Hash,
		Sparkles,
		Settings,
		Search,
		Moon,
		Sun,
		Link as LinkIcon
	} from '@lucide/svelte';
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
		}
	];
</script>

<ModeWatcher />
<SidebarProvider class="min-h-screen bg-background">
	<div class="flex w-full justify-center">
		<!-- Left Column: Sidebar Wrapper (Balanced) -->
		<div class="relative hidden flex-1 justify-end sm:flex">
			<Sidebar collapsible="icon" class="sticky top-0 h-screen shrink-0 border-l bg-background">
				<SidebarContent class="bg-background">
					<SidebarGroup class="p-0">
						<div class="flex h-14 items-center justify-between overflow-hidden border-b px-2 py-3">
							<div
								class="flex min-w-0 items-center gap-2 px-2 group-data-[collapsible=icon]:hidden"
							>
								<a href="/" class="flex items-center gap-2">
									<div
										class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
									>
										<LinkIcon class="h-4 w-4" />
									</div>
									<span class="truncate text-base font-bold tracking-tight">MyLinks</span>
								</a>
							</div>
							<div
								class="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
							>
								<SidebarTrigger />
							</div>
						</div>

						<SidebarGroupContent class="p-2">
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

				                <SidebarFooter
									class="flex flex-row items-center justify-between border-t bg-background p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1"
								>
									<Button
										variant="ghost"
										size="sm"
										class="h-9 justify-start gap-2 px-2 hover:bg-accent group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
										onclick={toggleMode}
										title="Toggle Theme"
									>
										<div class="flex shrink-0 items-center justify-center">
											<Moon class="h-4 w-4 dark:hidden" />
											<Sun class="hidden h-4 w-4 dark:block" />
										</div>
										<span
											class="text-[10px] font-bold uppercase tracking-wider group-data-[collapsible=icon]:hidden"
											>Theme</span
										>
									</Button>
				
									<Button
										variant="ghost"
										size="icon"
										href="/settings"
										class="h-9 w-9 shrink-0 {page.url.pathname === '/settings'
											? 'bg-accent text-accent-foreground'
											: ''}"
										title="Settings"
									>
										<Settings class="h-4 w-4" />
									</Button>
								</SidebarFooter>			</Sidebar>
		</div>

		<!-- Center Column: Main Feed -->
		<main class="relative min-h-screen w-full max-w-2xl border-r bg-background shadow-sm">
			{@render children?.()}
		</main>

		<!-- Right Column: Trends/Discovery Wrapper (Balanced) -->
		<div class="hidden flex-1 justify-start lg:flex">
			<aside class="sticky top-0 h-screen w-[350px] overflow-y-auto py-6 pr-4 pl-10">
				<div class="space-y-4 rounded-2xl border bg-background p-5 shadow-sm">
					<h2 class="px-2 text-lg font-bold tracking-tight">What's happening</h2>
					<div class="space-y-5">
						<div
							class="group cursor-pointer rounded-lg px-2 py-1 transition-colors hover:bg-muted/50"
						>
							<p class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
								Trending in Tech
							</p>
							<p class="text-[15px] font-bold transition-colors group-hover:text-primary">
								#Svelte5
							</p>
							<p class="text-[11px] text-muted-foreground">1,234 links</p>
						</div>
						<div
							class="group cursor-pointer rounded-lg px-2 py-1 transition-colors hover:bg-muted/50"
						>
							<p class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
								Local-first Apps
							</p>
							<p class="text-[15px] font-bold transition-colors group-hover:text-primary">
								#BunRuntime
							</p>
							<p class="text-[11px] text-muted-foreground">856 links</p>
						</div>
					</div>
					<Button variant="link" class="h-auto p-2 text-sm font-medium text-primary"
						>Show more</Button
					>
				</div>
			</aside>
		</div>

		<!-- Ghost Spacer: Keeps the feed centered when the right column is hidden (md to lg) -->
		<div class="hidden flex-1 sm:flex lg:hidden"></div>
	</div>
</SidebarProvider>
