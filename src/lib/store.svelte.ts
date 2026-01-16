import type { Link, AIConfig, Workspace } from './types';
import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';

const LINKS_STORAGE_KEY = 'links_data';
const AI_CONFIG_STORAGE_KEY = 'ai_config';
const WORKSPACES_STORAGE_KEY = 'workspaces_data';
const ACTIVE_WORKSPACE_KEY = 'active_workspace_id';

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

function loadWorkspaces(): Workspace[] {
	const defaultWorkspace: Workspace = {
		id: 'default',
		name: 'My Workspace',
		slug: 'my-workspace',
		createdAt: Date.now()
	};
	if (!browser) return [defaultWorkspace];
	try {
		const stored = localStorage.getItem(WORKSPACES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [defaultWorkspace];
	} catch {
		return [defaultWorkspace];
	}
}

function saveWorkspaces(workspaces: Workspace[]) {
	if (!browser) return;
	localStorage.setItem(WORKSPACES_STORAGE_KEY, JSON.stringify(workspaces));
}

function loadActiveWorkspaceId(): string {
	if (!browser) return 'default';
	return localStorage.getItem(ACTIVE_WORKSPACE_KEY) || 'default';
}

function saveActiveWorkspaceId(id: string) {
	if (!browser) return;
	localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
}

class LinkStore {
	links = $state<Link[]>(loadLinks());
	aiConfig = $state<AIConfig>(loadAIConfig());
	workspaces = $state<Workspace[]>(loadWorkspaces());
	activeWorkspaceId = $state<string>(loadActiveWorkspaceId());
	searchQuery = $state('');
	selectedTags = $state<string[]>([]);

	activeWorkspace = $derived.by(() => {
		return this.workspaces.find((w) => w.id === this.activeWorkspaceId) || this.workspaces[0];
	});

	workspaceLinks = $derived.by(() => {
		return this.links.filter((l) => l.workspaceId === this.activeWorkspaceId);
	});

	filteredLinks = $derived.by(() => {
		let result = this.workspaceLinks;
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
			result = result.filter((link) => this.selectedTags.every((tag) => link.tags.includes(tag)));
		}

		return [...result].sort((a, b) => b.createdAt - a.createdAt);
	});

	allTags = $derived.by(() => {
		const tagSet = new SvelteSet<string>();
		this.workspaceLinks.forEach((link) => {
			link.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	});

	add(link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
		const newLink: Link = {
			...link,
			id: crypto.randomUUID(),
			workspaceId: this.activeWorkspaceId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};
		this.links.push(newLink);
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
			this.selectedTags = this.selectedTags.filter((t) => t !== tag);
		} else {
			this.selectedTags.push(tag);
		}
	}

	// Workspace methods
	setActiveWorkspace(id: string) {
		this.activeWorkspaceId = id;
		this.selectedTags = []; // Reset filters when changing workspace
		saveActiveWorkspaceId(id);
	}

	addWorkspace(name: string) {
		const id = crypto.randomUUID();
		const slug = name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
		const newWorkspace: Workspace = {
			id,
			name,
			slug,
			createdAt: Date.now()
		};
		this.workspaces.push(newWorkspace);
		saveWorkspaces(this.workspaces);
		return newWorkspace;
	}

	removeWorkspace(id: string) {
		if (this.workspaces.length <= 1) return; // Prevent deleting last workspace
		this.workspaces = this.workspaces.filter((w) => w.id !== id);
		this.links = this.links.filter((l) => l.workspaceId !== id);
		if (this.activeWorkspaceId === id) {
			this.setActiveWorkspace(this.workspaces[0].id);
		}
		saveWorkspaces(this.workspaces);
		saveLinks(this.links);
	}
}

export const linkStore = new LinkStore();

export const links = {
	get all() {
		return linkStore.workspaceLinks;
	},
	get length() {
		return linkStore.workspaceLinks.length;
	}
};

export const workspaces = {
	get all() {
		return linkStore.workspaces;
	},
	get active() {
		return linkStore.activeWorkspace;
	},
	set activeId(id: string) {
		linkStore.setActiveWorkspace(id);
	},
	add: (name: string) => linkStore.addWorkspace(name),
	remove: (id: string) => linkStore.removeWorkspace(id)
};

export const aiConfig = {
	get enabled() {
		return linkStore.aiConfig.enabled;
	},
	get baseUrl() {
		return linkStore.aiConfig.baseUrl;
	},
	get apiKey() {
		return linkStore.aiConfig.apiKey;
	},
	get model() {
		return linkStore.aiConfig.model;
	}
};

export const search = {
	get query() {
		return linkStore.searchQuery;
	},
	set query(v: string) {
		linkStore.searchQuery = v;
	},
	get filteredLinks() {
		return linkStore.filteredLinks || [];
	}
};

export const selectedTags = {
	get all() {
		return linkStore.selectedTags;
	},
	get length() {
		return linkStore.selectedTags.length;
	},
	includes: (tag: string) => linkStore.selectedTags.includes(tag)
};

export const allTags = {
	get all() {
		return linkStore.allTags;
	}
};

export const addLink = (link: any) => linkStore.add(link);
export const updateLink = (id: string, updates: any) => linkStore.update(id, updates);
export const deleteLink = (id: string) => linkStore.remove(id);
export const updateAIConfig = (config: AIConfig) => linkStore.updateConfig(config);
export const toggleSelectedTag = (tag: string) => linkStore.toggleTag(tag);
export const setActiveWorkspace = (id: string) => linkStore.setActiveWorkspace(id);
export const addWorkspace = (name: string) => linkStore.addWorkspace(name);
export const removeWorkspace = (id: string) => linkStore.removeWorkspace(id);
