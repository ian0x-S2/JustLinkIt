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

	invalidateLink(id: string, workspaceId?: string) {
		this.linkCache.delete(id);

		if (workspaceId) {
			// Only invalidate collections for this specific workspace
			for (const key of this.collectionCache.keys()) {
				if (key.startsWith(`ws:${workspaceId}:`)) {
					this.collectionCache.delete(key);
				}
			}
		} else {
			// If workspaceId is not provided, we must be more conservative
			// but still better than clearing everything if we can find where it belongs
			this.collectionCache.clear();
		}
	}

	invalidateWorkspace(id: string) {
		this.workspaceCache.delete(id);
		// Only invalidate collections for this workspace
		for (const key of this.collectionCache.keys()) {
			if (key.startsWith(`ws:${id}:`)) {
				this.collectionCache.delete(key);
			}
		}
	}

	clear() {
		this.linkCache.clear();
		this.workspaceCache.clear();
		this.collectionCache.clear();
	}
}

export const cacheManager = new CacheManager();
