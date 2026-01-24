import type { Link, Workspace } from '$lib/types';

class CacheManager {
	private linkCache = new Map<string, Link>();
	private workspaceCache = new Map<string, Workspace>();
	private collectionCache = new Map<string, string[]>(); // key -> array of IDs

	getLink(id: string): Link | undefined {
		return this.linkCache.get(id);
	}

	setLink(link: Link) {
		this.linkCache.set(link.id, link);
	}

	getWorkspace(id: string): Workspace | undefined {
		return this.workspaceCache.get(id);
	}

	setWorkspace(workspace: Workspace) {
		this.workspaceCache.set(workspace.id, workspace);
	}

	getCollection(key: string): string[] | undefined {
		return this.collectionCache.get(key);
	}

	setCollection(key: string, ids: string[]) {
		this.collectionCache.set(key, ids);
	}

	invalidateLink(id: string) {
		this.linkCache.delete(id);
		// Invalidate all collection caches that might contain this link
		this.collectionCache.clear();
	}

	invalidateWorkspace(id: string) {
		this.workspaceCache.delete(id);
		this.collectionCache.clear();
	}

	clear() {
		this.linkCache.clear();
		this.workspaceCache.clear();
		this.collectionCache.clear();
	}
}

export const cacheManager = new CacheManager();
