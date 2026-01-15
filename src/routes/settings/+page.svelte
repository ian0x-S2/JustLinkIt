<script lang="ts">
	import { linkStore, updateAIConfig } from '$lib/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { ArrowLeft, Sparkles, Shield, Cpu } from '@lucide/svelte';

	// We use a local state for the form, initialized with current config
	// Since aiConfig in store is a Rune-based object, we spread its current values
	let config = $state({
		enabled: linkStore.aiConfig.enabled,
		baseUrl: linkStore.aiConfig.baseUrl,
		apiKey: linkStore.aiConfig.apiKey,
		model: linkStore.aiConfig.model
	});

	function save() {
		updateAIConfig(config);
	}
</script>

<div class="flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
	<Button variant="ghost" size="icon" href="/" class="mr-2 h-8 w-8 rounded-full">
		<ArrowLeft class="h-4 w-4" />
	</Button>
	<h1 class="text-xl font-bold tracking-tight">Settings</h1>
</div>

<div class="mx-auto max-w-2xl space-y-8 p-4">
	<!-- Section: AI Features -->
	<section class="space-y-4">
		<div class="px-1">
			<div class="mb-1 flex items-center gap-2">
				<Sparkles class="h-4 w-4 text-primary" />
				<h2 class="text-lg font-bold tracking-tight">Intelligence</h2>
			</div>
			<p class="text-sm text-muted-foreground">
				Opt-in AI features for smart tagging and summarization.
			</p>
		</div>

		<Card class="border-none bg-background shadow-none">
			<CardContent class="space-y-6 p-0">
				<div
					class="flex items-start justify-between rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
				>
					<div class="space-y-1">
						<Label for="ai-enabled" class="cursor-pointer text-base font-bold"
							>Enable AI Engine</Label
						>
						<p class="max-w-[400px] text-xs leading-relaxed text-muted-foreground">
							Requires an OpenAI-compatible API key. Your data never leaves your device except for
							the requests sent to your chosen provider.
						</p>
					</div>
					<Checkbox id="ai-enabled" bind:checked={config.enabled} class="mt-1" />
				</div>

				{#if config.enabled}
					<div
						class="space-y-6 rounded-xl border bg-background p-6 duration-300 animate-in fade-in slide-in-from-top-2"
					>
						<div class="grid gap-6">
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Cpu class="h-3.5 w-3.5 text-muted-foreground" />
									<Label
										for="base-url"
										class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
										>Provider API URL</Label
									>
								</div>
								<Input
									id="base-url"
									placeholder="https://api.openai.com/v1"
									bind:value={config.baseUrl}
									class="border-none bg-muted/30 focus-visible:ring-1"
								/>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Shield class="h-3.5 w-3.5 text-muted-foreground" />
									<Label
										for="api-key"
										class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
										>API Key</Label
									>
								</div>
								<Input
									id="api-key"
									type="password"
									placeholder="sk-..."
									bind:value={config.apiKey}
									class="border-none bg-muted/30 focus-visible:ring-1"
								/>
							</div>

							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<div class="flex h-3.5 w-3.5 items-center justify-center">
										<span class="text-[10px] font-bold">M</span>
									</div>
									<Label
										for="model"
										class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
										>Model Name</Label
									>
								</div>
								<Input
									id="model"
									placeholder="gpt-4o-mini"
									bind:value={config.model}
									class="border-none bg-muted/30 focus-visible:ring-1"
								/>
							</div>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</section>

	<Separator class="opacity-50" />

	<!-- Section: About / Info -->
	<section class="space-y-4 px-1">
		<h3 class="text-sm font-bold tracking-widest text-muted-foreground uppercase">System</h3>
		<div class="flex items-center justify-between py-2">
			<div>
				<p class="font-medium">Data Storage</p>
				<p class="text-xs text-muted-foreground">Local (Browser Storage)</p>
			</div>
			<Badge variant="outline" class="text-[10px] font-bold tracking-tighter uppercase"
				>Healthy</Badge
			>
		</div>
	</section>

	<!-- Footer Actions -->
	<div class="flex justify-end gap-3 pt-6">
		<Button variant="ghost" href="/" class="rounded-full px-6">Cancel</Button>
		<Button onclick={save} class="rounded-full px-8 shadow-md">Save Changes</Button>
	</div>
</div>
