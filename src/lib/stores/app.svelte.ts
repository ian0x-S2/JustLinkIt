import { browser } from '$app/environment';
import type { Link, Workspace, WorkspaceId } from '$lib/types';
import { STORAGE_KEYS } from '$lib/constants';
import { ConsoleLogger, Repository, type Logger } from './infra';
import { createLinkStore, createWorkspaceStore } from './domain';
import { createFilterStore, createSettingsStore, createThemeStore } from './ui';

export interface CreateAppStoreOptions {
	initialData?: {
		workspaces: Workspace[];
		links: Link[];
		activeWorkspaceId: WorkspaceId;
		viewMode?: 'list' | 'grid';
		theme?: ThemeId;
	};
	// Injeção para testes
	repository?: Repository;
	logger?: Logger;
}

export interface AppStore {
	// Domain stores
	readonly links: ReturnType<typeof createLinkStore>;
	readonly workspaces: ReturnType<typeof createWorkspaceStore>;

	// Infra
	readonly repository: Repository;

	// UI stores
	readonly filters: ReturnType<typeof createFilterStore>;
	readonly settings: ReturnType<typeof createSettingsStore>;
	readonly theme: ReturnType<typeof createThemeStore>;

	// Orchestration actions
	setActiveWorkspace(id: WorkspaceId): Promise<void>;
	hydrate(data: CreateAppStoreOptions['initialData']): void;
	migrateFromLocalStorageIfNeeded(): Promise<void>;
}

export function createAppStore(options: CreateAppStoreOptions = {}): AppStore {
	const logger = options.logger ?? new ConsoleLogger();
	const repository = options.repository ?? new Repository(logger);

	// Create domain stores
	const workspaces = createWorkspaceStore({
		repository,
		logger,
		initialWorkspaces: options.initialData?.workspaces,
		initialActiveId: options.initialData?.activeWorkspaceId
	});

	const links = createLinkStore({
		repository,
		logger,
		initialLinks: options.initialData?.links
	});

	// Create UI stores with references to domain state
	const filters = createFilterStore({
		getLinks: () => links.links
	});

	const settings = createSettingsStore(options.initialData?.viewMode);
	const theme = createThemeStore(options.initialData?.theme);

	// Orchestrated action: Switch workspace with side effects
	async function setActiveWorkspace(id: WorkspaceId): Promise<void> {
		workspaces.setActive(id);
		filters.reset(); // Clear filters when switching workspaces
		await links.fetchForWorkspace(id);

		// Persist to cookie
		if (browser) {
			document.cookie = `${STORAGE_KEYS.ACTIVE_WORKSPACE}=${id}; path=/; max-age=31536000; SameSite=Lax`;
		}
	}

	// Hydrate all stores with initial data
	function hydrate(data: CreateAppStoreOptions['initialData']): void {
		if (!data) return;
		workspaces.hydrate(data.workspaces, data.activeWorkspaceId);
		links.hydrate(data.links);
		if (data.viewMode && settings.viewMode !== data.viewMode) {
			settings.setViewMode(data.viewMode);
		}
		if (data.theme && theme.current !== data.theme) {
			theme.setTheme(data.theme);
		}
	}

	// Migration from localStorage to SQLite
	async function migrateFromLocalStorageIfNeeded(): Promise<void> {
		if (!browser || localStorage.getItem(STORAGE_KEYS.MIGRATED_SQLITE)) return;

		const localLinks = localStorage.getItem(STORAGE_KEYS.LEGACY_LINKS);
		const localWorkspaces = localStorage.getItem(STORAGE_KEYS.LEGACY_WORKSPACES);

		if (localLinks || localWorkspaces) {
			const data = {
				links: localLinks ? JSON.parse(localLinks) : [],
				workspaces: localWorkspaces ? JSON.parse(localWorkspaces) : []
			};

			const result = await repository.migrate(data);
			if (result.ok) {
				localStorage.setItem(STORAGE_KEYS.MIGRATED_SQLITE, 'true');
				window.location.reload();
			} else {
				logger.error('Migration failed', result.error);
			}
		} else {
			localStorage.setItem(STORAGE_KEYS.MIGRATED_SQLITE, 'true');
		}
	}

	return {
		links,
		workspaces,
		repository,
		filters,
		settings,
		theme,
		setActiveWorkspace,
		hydrate,
		migrateFromLocalStorageIfNeeded
	};
}
