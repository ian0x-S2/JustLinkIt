/**
 * Branded type for Link IDs to prevent accidental ID confusion
 */
export type LinkId = string & { readonly __brand: 'LinkId' };

/**
 * Branded type for Workspace IDs
 */
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' };

export interface Workspace {
	id: WorkspaceId;
	name: string;
	slug: string;
	icon?: string;
	createdAt: number;
	linkCount?: number;
}

export interface Link {
	id: LinkId;
	url: string;
	title: string | null;
	description: string | null;
	image: string | null;
	author?: string | null;
	publisher?: string | null;
	logo?: string | null;
	createdAt: number;
	updatedAt: number;
	tags: string[];
	workspaceId: WorkspaceId;
	isFavorite?: boolean;
	isDeleted?: boolean;
}

/**
 * Standard Result type for operations that can fail
 */
export type Result<T, E = Error> = 
	| { ok: true; value: T }
	| { ok: false; error: E };

export interface ApiError {
	message: string;
	code?: string;
	status?: number;
}