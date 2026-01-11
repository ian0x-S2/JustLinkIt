import { aiConfig } from './store.svelte.ts';

interface AIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

export async function generateSummary(
	url: string,
	title: string | null,
	description: string | null
): Promise<string> {
	if (!aiConfig.enabled || !aiConfig.apiKey) {
		throw new Error('AI is not configured');
	}

	const context = `URL: ${url}\nTitle: ${title || 'N/A'}\nDescription: ${description || 'N/A'}`;

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
						'You are a helpful assistant. Provide a concise summary of the webpage content in 1-2 sentences.'
				},
				{
					role: 'user',
					content: context
				}
			],
			max_tokens: 100
		})
	});

	if (!response.ok) {
		throw new Error('Failed to generate summary');
	}

	const data: AIResponse = await response.json();
	return data.choices[0]?.message?.content || 'No summary generated';
}

export async function suggestTags(
	url: string,
	title: string | null,
	description: string | null
): Promise<string[]> {
	if (!aiConfig.enabled || !aiConfig.apiKey) {
		throw new Error('AI is not configured');
	}

	const context = `URL: ${url}\nTitle: ${title || 'N/A'}\nDescription: ${description || 'N/A'}`;

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
						'You are a helpful assistant. Suggest 3-5 relevant tags for this content. Return only comma-separated tags, no explanations.'
				},
				{
					role: 'user',
					content: context
				}
			],
			max_tokens: 50
		})
	});

	if (!response.ok) {
		throw new Error('Failed to suggest tags');
	}

	const data: AIResponse = await response.json();
	const tags = data.choices[0]?.message?.content || '';
	return tags
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter(Boolean);
}

export function estimateCost(tokens: number): number {
	return (tokens / 1000) * 0.0001;
}
