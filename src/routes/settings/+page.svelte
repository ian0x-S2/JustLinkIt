<script lang="ts">
	import { aiConfig, updateAIConfig } from '$lib/store.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';

	let config = $state({ ...aiConfig });

	function save() {
		updateAIConfig(config);
	}
</script>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Settings</h1>
		<p class="text-muted-foreground">Manage your application preferences.</p>
	</div>

	<Separator />

	<Card>
		<CardHeader>
			<CardTitle>Advanced Features (Optional)</CardTitle>
			<CardDescription>
				Configure AI features. These are disabled by default and require an OpenAI-compatible API key.
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<Label
				class="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5"
			>
				<Checkbox
					id="ai-enabled"
					bind:checked={config.enabled}
					class="mt-1"
				/>
				<div class="grid gap-1.5 font-normal">
					<p class="text-sm leading-none font-medium">Enable AI Features</p>
					<p class="text-muted-foreground text-sm">
						Summarization, tag suggestions, and recurring themes analysis.
					</p>
				</div>
			</Label>

			{#if config.enabled}
				<div class="space-y-4 pt-4">
					<div class="space-y-2">
						<Label for="base-url">Base URL</Label>
						<Input
							id="base-url"
							placeholder="https://api.openai.com/v1"
							bind:value={config.baseUrl}
						/>
						<p class="text-xs text-muted-foreground">The endpoint for your OpenAI-compatible API.</p>
					</div>

					<div class="space-y-2">
						<Label for="api-key">API Key</Label>
						<Input
							id="api-key"
							type="password"
							placeholder="sk-..."
							bind:value={config.apiKey}
						/>
					</div>

					<div class="space-y-2">
						<Label for="model">Model</Label>
						<Input id="model" placeholder="gpt-4o-mini" bind:value={config.model} />
					</div>
				</div>
			{/if}
		</CardContent>
		<CardFooter>
			<Button onclick={save} class="ml-auto">Save Configuration</Button>
		</CardFooter>
	</Card>
</div>
