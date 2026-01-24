import type { Link, Workspace } from './types';
import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';

const ACTIVE_WORKSPACE_KEY = 'active_workspace_id';
const MIGRATED_KEY = 'sqlite_migrated';

export class LinkStore {
	links = $state<Link[]>([]);
	workspaces = $state<Workspace[]>([]);
	activeWorkspaceId = $state<string>('default');
	activeCategory = $state<'inbox' | 'favorites' | 'archive' | 'trash'>('inbox');
	searchQuery = $state('');
	selectedTags = $state<string[]>([]);

	constructor(data?: { workspaces: Workspace[], links: Link[], activeWorkspaceId: string }) {
		if (data) {
			this.workspaces = data.workspaces;
			this.links = data.links;
			this.activeWorkspaceId = data.activeWorkspaceId;
		}
	}

	async maybeMigrate() {
		if (!browser || localStorage.getItem(MIGRATED_KEY)) return;

		const localLinks = localStorage.getItem('links_data');
		const localWorkspaces = localStorage.getItem('workspaces_data');

		if (localLinks || localWorkspaces) {
			try {
				const response = await fetch('/api/migrate', {
					method: 'POST',
					body: JSON.stringify({
						links: localLinks ? JSON.parse(localLinks) : [],
						workspaces: localWorkspaces ? JSON.parse(localWorkspaces) : []
					})
				});
				if (response.ok) {
					localStorage.setItem(MIGRATED_KEY, 'true');
					window.location.reload(); 
				}
			} catch (e) {
				console.error('Migration failed', e);
			}
		} else {
			localStorage.setItem(MIGRATED_KEY, 'true');
		}
	}

	async loadLinks() {
		const params = new URLSearchParams({
			workspaceId: this.activeWorkspaceId,
			all: 'true'
		});
		const res = await fetch(`/api/links?${params}`);
		this.links = await res.json();
	}

	activeWorkspace = $derived.by(() => {
		const found = this.workspaces.find((w) => w.id === this.activeWorkspaceId);
		if (found) return found;
		
		if (this.workspaces.length > 0) return this.workspaces[0];

		return {
			id: 'default',
			name: 'My Workspace',
			slug: 'my-workspace',
			createdAt: 0
		} as Workspace;
	});

	filteredLinks = $derived.by(() => {
		let result = this.links;

		if (this.activeCategory === 'inbox') {
			result = result.filter(l => !l.isArchived && !l.isDeleted);
		} else if (this.activeCategory === 'favorites') {
			result = result.filter(l => l.isFavorite && !l.isDeleted);
		} else if (this.activeCategory === 'archive') {
			result = result.filter(l => l.isArchived && !l.isDeleted);
		} else if (this.activeCategory === 'trash') {
			result = result.filter(l => l.isDeleted);
		}

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
		this.links.forEach((link) => {
			link.tags.forEach((tag) => tagSet.add(tag));
		});
		return Array.from(tagSet).sort();
	});

	async add(link: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) {
		const id = crypto.randomUUID();
		const now = Date.now();
		const newLink: Link = {
			...link,
			id,
			workspaceId: this.activeWorkspaceId,
			createdAt: now,
			updatedAt: now,
			isFavorite: false,
			isArchived: false,
			isDeleted: false,
			tags: (link as any).tags || []
		};

		this.links = [newLink, ...this.links];

		try {
			const res = await fetch('/api/links', {
				method: 'POST',
				body: JSON.stringify({ ...link, workspaceId: this.activeWorkspaceId })
			});
			if (!res.ok) throw new Error('Failed to save');
			const saved = await res.json();
			const idx = this.links.findIndex(l => l.id === id);
			if (idx !== -1) this.links[idx] = saved;
		} catch (e) {
			this.links = this.links.filter(l => l.id !== id);
			console.error('Add failed', e);
		}
	}

	async update(id: string, updates: Partial<Link>) {
		const index = this.links.findIndex((l) => l.id === id);
		if (index === -1) return;

		const original = { ...this.links[index] };
		this.links[index] = { ...this.links[index], ...updates, updatedAt: Date.now() };

		try {
			const res = await fetch(`/api/links/${id}`, {
				method: 'PATCH',
				body: JSON.stringify(updates)
			});
			if (!res.ok) throw new Error();
		} catch (e) {
			this.links[index] = original;
		}
	}

	async toggleFavorite(id: string) {
		const link = this.links.find(l => l.id === id);
		if (link) await this.update(id, { isFavorite: !link.isFavorite });
	}

	async toggleArchived(id: string) {
		const link = this.links.find(l => l.id === id);
		if (link) {
			await this.update(id, { isArchived: !link.isArchived });
		}
	}

	async toggleDeleted(id: string) {
		const link = this.links.find(l => l.id === id);
		if (link) {
			await this.update(id, { isDeleted: !link.isDeleted });
		}
	}

	async remove(id: string) {
		const original = this.links;
		this.links = this.links.filter((l) => l.id !== id);
		try {
			const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error();
		} catch (e) {
			this.links = original;
		}
	}

	async setActiveWorkspace(id: string) {
		this.activeWorkspaceId = id;
		this.selectedTags = [];
		this.activeCategory = 'inbox';
		if (browser) {
			document.cookie = `${ACTIVE_WORKSPACE_KEY}=${id}; path=/; max-age=31536000`;
		}
		await this.loadLinks();
	}

	async setCategory(category: 'inbox' | 'favorites' | 'archive' | 'trash') {
		this.activeCategory = category;
	}

	async addWorkspace(name: string) {
		try {
			const res = await fetch('/api/workspaces', {
				method: 'POST',
				body: JSON.stringify({ name })
			});
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || 'Failed to create workspace');
			}
			const newWorkspace = await res.json();
			if (!newWorkspace || !newWorkspace.id) {
				throw new Error('Invalid workspace returned from API');
			}
			this.workspaces = [...this.workspaces, newWorkspace];
			return newWorkspace;
		} catch (e) {
			console.error('Add workspace failed:', e);
			throw e;
		}
	}

	async removeWorkspace(id: string) {
		if (this.workspaces.length <= 1) return;
		this.workspaces = this.workspaces.filter((w) => w.id !== id);
		await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
	}

	toggleTag(tag: string) {
		if (this.selectedTags.includes(tag)) {
			this.selectedTags = this.selectedTags.filter((t) => t !== tag);
		} else {
			this.selectedTags = [...this.selectedTags, tag];
		}
	}
}