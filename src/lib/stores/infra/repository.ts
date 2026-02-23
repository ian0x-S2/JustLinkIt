import type { Link, Workspace, LinkId, WorkspaceId, Result, ApiError } from '$lib/types';
import { SvelteURLSearchParams } from 'svelte/reactivity';
import { API_ENDPOINTS, APP_CONFIG } from '$lib/constants';
import type { Logger } from './logger';

/**
 * Data access layer for Links and Workspaces.
 * Handles API communication, retries, and error mapping.
 */
export class Repository {
	constructor(private logger: Logger) {}

	private async fetchWithRetry<T>(
		url: string,
		options?: RequestInit,
		retries = APP_CONFIG.RETRY_ATTEMPTS
	): Promise<Result<T, ApiError>> {
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					ok: false,
					error: {
						message: errorData.error || response.statusText,
						status: response.status
					}
				};
			}
			const value = await response.json();
			return { ok: true, value };
		} catch (err) {
			if (retries > 0) {
				await new Promise((r) => setTimeout(r, APP_CONFIG.RETRY_DELAY_MS));
				return this.fetchWithRetry(url, options, retries - 1);
			}
			this.logger.error(`API Request failed: ${url}`, err);
			return {
				ok: false,
				error: { message: err instanceof Error ? err.message : 'Network error' }
			};
		}
	}

	async fetchLinks(workspaceId: WorkspaceId): Promise<Result<Link[], ApiError>> {
		const params = new SvelteURLSearchParams({ workspaceId, all: 'true' });
		return this.fetchWithRetry<Link[]>(`${API_ENDPOINTS.LINKS}?${params}`);
	}

	async createLink(linkData: Partial<Link>): Promise<Result<Link, ApiError>> {
		return this.fetchWithRetry<Link>(API_ENDPOINTS.LINKS, {
			method: 'POST',
			body: JSON.stringify(linkData)
		});
	}

	async updateLink(id: LinkId, updates: Partial<Link>): Promise<Result<void, ApiError>> {
		return this.fetchWithRetry<void>(`${API_ENDPOINTS.LINKS}/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async deleteLink(id: LinkId): Promise<Result<void, ApiError>> {
		return this.fetchWithRetry<void>(`${API_ENDPOINTS.LINKS}/${id}`, { method: 'DELETE' });
	}

	async createWorkspace(name: string): Promise<Result<Workspace, ApiError>> {
		return this.fetchWithRetry<Workspace>(API_ENDPOINTS.WORKSPACES, {
			method: 'POST',
			body: JSON.stringify({ name })
		});
	}

	async deleteWorkspace(id: WorkspaceId): Promise<Result<void, ApiError>> {
		return this.fetchWithRetry<void>(`${API_ENDPOINTS.WORKSPACES}/${id}`, { method: 'DELETE' });
	}

	async updateWorkspace(id: WorkspaceId, updates: { name: string }): Promise<Result<Workspace, ApiError>> {
		return this.fetchWithRetry<Workspace>(`${API_ENDPOINTS.WORKSPACES}/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(updates)
		});
	}

	async migrate(data: { links: Link[]; workspaces: Workspace[] }): Promise<Result<void, ApiError>> {
		return this.fetchWithRetry<void>(API_ENDPOINTS.MIGRATE, {
			method: 'POST',
			body: JSON.stringify(data)
		});
	}
}
