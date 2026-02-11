export const STORAGE_KEYS = {
	ACTIVE_WORKSPACE: 'active_workspace_id',
	VIEW_MODE: 'view_mode',
	MIGRATED_SQLITE: 'sqlite_migrated',
	LEGACY_LINKS: 'links_data',
	LEGACY_WORKSPACES: 'workspaces_data'
} as const;

export const API_ENDPOINTS = {
	LINKS: '/api/links',
	WORKSPACES: '/api/workspaces',
	MIGRATE: '/api/migrate'
} as const;

export const CATEGORIES = {
	INBOX: 'inbox',
	FAVORITES: 'favorites',
	TRASH: 'trash'
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];

export const APP_CONFIG = {
	DEFAULT_WORKSPACE_ID: 'default' as const,
	RETRY_ATTEMPTS: 3,
	RETRY_DELAY_MS: 1000
};
