import type { Link, AIConfig } from './types';
import { browser } from '$app/environment';

const LINKS_STORAGE_KEY = 'links_data';
const AI_CONFIG_STORAGE_KEY = 'ai_config';

function loadLinks(): Link[] {
	if (!browser) return [];
	try {
		const stored = localStorage.getItem(LINKS_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveLinks(links: Link[]) {
	if (!browser) return;
	localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
}

function loadAIConfig(): AIConfig {
	if (!browser)
		return {
			enabled: false,
			baseUrl: 'https://api.openai.com/v1',
			apiKey: '',
			model: 'gpt-4o-mini'
		};
	try {
		const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
		return stored
			? JSON.parse(stored)
			: { enabled: false, baseUrl: 'https://api.openai.com/v1', apiKey: '', model: 'gpt-4o-mini' };
	} catch {
		return {
			enabled: false,
			baseUrl: 'https://api.openai.com/v1',
			apiKey: '',
			model: 'gpt-4o-mini'
		};
	}
}

function saveAIConfig(config: AIConfig) {
	if (!browser) return;
	localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export const links = $state<Link[]>(loadLinks());
export const aiConfig = $state<AIConfig>(loadAIConfig());
export const search = $state({ query: '' });

export function getAllTags(): string[] {
	const tagSet = new Set<string>();
	links.forEach((link) => {
		link.tags.forEach((tag) => tagSet.add(tag));
	});
	return Array.from(tagSet).sort();
}

export function getFilteredLinks(): Link[] {
	let result = links;

	const query: string = search.query?.toLowerCase() ?? '';

	if (query) {
		result = result.filter((link) => {
			const titleMatch = link.title?.toLowerCase().includes(query) ?? false;
			const urlMatch = link.url.toLowerCase().includes(query);
			const descMatch = link.description?.toLowerCase().includes(query) ?? false;
			const tagMatch = link.tags.some((tag: string) => tag.toLowerCase().includes(query));
			return titleMatch || urlMatch || descMatch || tagMatch;
		});
	}

	if (selectedTags.length > 0) {
		result = result.filter((link) => selectedTags.every((tag) => link.tags.includes(tag)));
	}

	return result.sort((a, b) => b.createdAt - a.createdAt);
}

export function addLink(link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) {
	links.push({
		...link,
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		updatedAt: Date.now()
	});
	saveLinks(links);
}

export function updateLink(id: string, updates: Partial<Link>) {
	const link = links.find((l) => l.id === id);
	if (link) {
		Object.assign(link, updates, { updatedAt: Date.now() });
		saveLinks(links);
	}
}

export function deleteLink(id: string) {
	const index = links.findIndex((l) => l.id === id);
	if (index !== -1) {
		links.splice(index, 1);
		saveLinks(links);
	}
}

export function updateAIConfig(config: AIConfig) {
	Object.assign(aiConfig, config);
	saveAIConfig(aiConfig);
}

export const selectedTags = $state<string[]>([]);

export function toggleSelectedTag(tag: string) {
	if (selectedTags.includes(tag)) {
		const index = selectedTags.indexOf(tag);
		selectedTags.splice(index, 1);
	} else {
		selectedTags.push(tag);
	}
}

export function clearSelectedTags() {
	selectedTags.length = 0;
}
