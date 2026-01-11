<script lang="ts">
	import { aiConfig, links } from '$lib/store.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Sparkles, AlertCircle } from '@lucide/svelte';
	import { Separator } from '$lib/components/ui/separator';

	let insights = $state<string[]>([]);
	let loading = $state(false);

	async function generateInsights() {
		if (!aiConfig.enabled || !aiConfig.apiKey) return;
		loading = true;
		try {
			// Basic recurring themes analysis
			const context = links
				.slice(0, 20)
				.map((l) => `Title: ${l.title}\nTags: ${l.tags.join(', ')}`)
				.join('\n\n');

			const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${aiConfig.apiKey}`
				},
				body: JSON.stringify({
					model: aiConfig.model,
					messages: [
						{
							role: 'system',
							content:
								'Analyze these links and identify 3-5 recurring themes or interesting patterns. Return them as a simple list of bullet points.'
						},
						{
							role: 'user',
							content: context
						}
					],
					max_tokens: 200
				})
			});

			if (!response.ok) throw new Error('Failed to generate insights');
			const data = await response.json();
			const content = data.choices[0]?.message?.content || '';
			insights = content
				.split('\n')
				.filter((line: string) => line.trim().length > 0)
				.map((line: string) => line.replace(/^[*-]\s*/, ''));
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Suggestions</h1>
		<p class="text-muted-foreground">AI-driven insights based on your saved links.</p>
	</div>

	<Separator />

	{#if !aiConfig.enabled}
		<Card class="border-dashed">
			<CardContent class="flex flex-col items-center justify-center py-10 text-center space-y-4">
				<div class="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
					<Sparkles class="h-6 w-6 text-muted-foreground" />
				</div>
				<div class="space-y-2">
					<h3 class="font-semibold">AI Features are Disabled</h3>
					<p class="text-sm text-muted-foreground max-w-sm">
						Enable advanced features in settings to get insights and themes based on your links.
					</p>
				</div>
				<Button variant="outline" href="/settings">Go to Settings</Button>
			</CardContent>
		</Card>
	{:else}
		<div class="grid gap-6">
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between">
						<div class="space-y-1">
							<CardTitle>Recurring Themes</CardTitle>
							<CardDescription>Patterns identified across your recent links.</CardDescription>
						</div>
						<Button onclick={generateInsights} disabled={loading || links.length === 0}>
							{#if loading}
								Analyzing...
							{:else}
								<Sparkles class="mr-2 h-4 w-4" />
								Generate Insights
							{/if}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{#if insights.length > 0}
						<ul class="space-y-4">
							{#each insights as insight}
								<li class="flex items-start gap-3">
									<div class="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
									<span>{insight}</span>
								</li>
							{/each}
						</ul>
					{:else if links.length === 0}
						<p class="text-sm text-muted-foreground italic">Add some links first to generate insights.</p>
					{:else}
						<p class="text-sm text-muted-foreground italic">Click the button to analyze your library.</p>
					{/if}
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
