import type { ThemeId, Workspace, WorkspaceId } from './types';

export const STORAGE_KEYS = {
	ACTIVE_WORKSPACE: 'active_workspace_id',
	VIEW_MODE: 'view_mode',
	MIGRATED_SQLITE: 'sqlite_migrated',
	LEGACY_LINKS: 'links_data',
	LEGACY_WORKSPACES: 'workspaces_data',
	THEME: 'selected_theme'
} as const;

export const THEMES = {
	DEFAULT: 'default' as ThemeId,
	EVERFOREST: 'everforest' as ThemeId,
	NORD: 'nord' as ThemeId
} as const;

export const PWA_THEME_COLORS = {
	[THEMES.DEFAULT]: {
		light: '#bac2de',
		dark: '#1e1e2e'
	},
	[THEMES.EVERFOREST]: {
		light: '#f3eacb',
		dark: '#2d333b'
	},
	[THEMES.NORD]: {
		light: '#d8dee9',
		dark: '#272c38'
	}
} as const;

export function getPwaThemeColor(theme: ThemeId, isDark: boolean): string {
	const themeColors = PWA_THEME_COLORS[theme] ?? PWA_THEME_COLORS[THEMES.DEFAULT];
	return isDark ? themeColors.dark : themeColors.light;
}

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

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const APP_CONFIG = {
	DEFAULT_WORKSPACE_ID: 'default' as const,
	RETRY_ATTEMPTS: 3,
	RETRY_DELAY_MS: 1000,
	TAG_LIMIT: 10,
	SEARCH_DEBOUNCE_MS: 500,
	DB: {
		JOURNAL_MODE: 'WAL',
		SYNCHRONOUS: 'NORMAL'
	}
};

export const TUI_DIMENSIONS = {
	SIDEBAR_WIDTH: 280,
	SIDEBAR_WIDTH_LG: 320,
	PANEL_GAP: 8,
	ITEM_HEIGHT: 36,
	HEADER_HEIGHT: 24,
	LINE_HEIGHT: 20,
	PADDING: 8,
	GAP: 4
} as const;

export const DEFAULT_WORKSPACE: Workspace = {
	id: APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId,
	name: 'My Workspace',
	slug: 'my-workspace',
	createdAt: 1708512000000 // Stable timestamp
};
