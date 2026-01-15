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
	const defaultConfig: AIConfig = {
		enabled: false,
		baseUrl: 'https://api.openai.com/v1',
		apiKey: '',
		model: 'gpt-4o-mini'
	};
	if (!browser) return defaultConfig;
	try {
		const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
		return stored ? JSON.parse(stored) : defaultConfig;
	} catch {
		return defaultConfig;
	}
}

function saveAIConfig(config: AIConfig) {
	if (!browser) return;
	localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

class LinkStore {
	links = $state<Link[]>(loadLinks());
	aiConfig = $state<AIConfig>(loadAIConfig());
	searchQuery = $state('');
	selectedTags = $state<string[]>([]);

	filteredLinks = $derived.by(() => {
		let result = this.links;
		const query = (this.searchQuery || '').toLowerCase();

		if (query) {
			result = result.filter((link) => {
				const titleMatch = link.title?.toLowerCase().includes(query) ?? false;
				const urlMatch = link.url.toLowerCase().includes(query);
				const descMatch = link.description?.toLowerCase().includes(query) ?? false;
				const tagMatch = link.tags.some((tag) => tag.toLowerCase().includes(query));
				return titleMatch || urlMatch || descMatch || tagMatch;
			});
		}

		if (this.selectedTags.length > 0) {
			result = result.filter((link) => 
				this.selectedTags.every((tag) => link.tags.includes(tag))
			);
		}

		return [...result].sort((a, b) => b.createdAt - a.createdAt);
	});

	allTags = $derived.by(() => {
		const tagSet = new Set<string>();
		this.links.forEach((link) => {
			link.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	});

	add(link: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>) {
		this.links.push({
			...link,
			id: crypto.randomUUID(),
			createdAt: Date.now(),
			updatedAt: Date.now()
		});
		saveLinks(this.links);
	}

	update(id: string, updates: Partial<Link>) {
		const index = this.links.findIndex((l) => l.id === id);
		if (index !== -1) {
			this.links[index] = { ...this.links[index], ...updates, updatedAt: Date.now() };
			saveLinks(this.links);
		}
	}

	remove(id: string) {
		this.links = this.links.filter((l) => l.id !== id);
		saveLinks(this.links);
	}

	updateConfig(config: AIConfig) {
		this.aiConfig = { ...this.aiConfig, ...config };
		saveAIConfig(this.aiConfig);
	}

	toggleTag(tag: string) {
		if (this.selectedTags.includes(tag)) {
			this.selectedTags = this.selectedTags.filter(t => t !== tag);
		} else {
			this.selectedTags.push(tag);
		}
	}
}

export const linkStore = new LinkStore();

// Named exports for compatibility with existing components
export const addLink = (link: any) => linkStore.add(link);
export const updateLink = (id: string, updates: any) => linkStore.update(id, updates);
export const deleteLink = (id: string) => linkStore.remove(id);
export const updateAIConfig = (config: any) => linkStore.updateConfig(config);
export const toggleSelectedTag = (tag: string) => linkStore.toggleTag(tag);

// Compatibility objects
export const links = {
	get all() { return linkStore.links; },
	add: addLink,
	remove: deleteLink,
	update: updateLink
};

export const search = {
	get query() { return linkStore.searchQuery; },
	set query(v: string) { linkStore.searchQuery = v; },
	get filteredLinks() { return linkStore.filteredLinks || []; }
};

export const selectedTags = {
	get length() { return linkStore.selectedTags.length; },
	includes: (tag: string) => linkStore.selectedTags.includes(tag)
};