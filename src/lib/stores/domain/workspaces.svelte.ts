import type { Workspace, WorkspaceId, Result, ApiError } from '$lib/types';
import { APP_CONFIG } from '$lib/constants';
import type { Repository, Logger } from '../infra';

const DEFAULT_WORKSPACE: Workspace = {
	id: APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId,
	name: 'My Workspace',
	slug: 'my-workspace',
	createdAt: Date.now()
};

export interface CreateWorkspaceStoreOptions {
	repository: Repository;
	logger: Logger;
	initialWorkspaces?: Workspace[];
	initialActiveId?: WorkspaceId;
}

export interface WorkspaceStore {
	// Estado
	readonly workspaces: Workspace[];
	readonly activeId: WorkspaceId;
	readonly active: Workspace;
	readonly count: number;

	// Ações
	setActive(id: WorkspaceId): void;
	add(name: string): Promise<Result<Workspace, ApiError>>;
	remove(id: WorkspaceId): Promise<void>;
	hydrate(workspaces: Workspace[], activeId: WorkspaceId): void;
}

export function createWorkspaceStore(options: CreateWorkspaceStoreOptions): WorkspaceStore {
	const { repository, logger, initialWorkspaces = [], initialActiveId } = options;

	// Estado privado
	let _workspaces = $state<Workspace[]>(initialWorkspaces);
	let _activeId = $state<WorkspaceId>(
		initialActiveId ?? (APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId)
	);

	// Estado derivado público
	const workspaces = $derived(_workspaces);
	const activeId = $derived.by(() => {
		const found = _workspaces.find((w) => w.id === _activeId);
		if (found) return _activeId;
		if (_workspaces.length > 0) return _workspaces[0].id;
		return APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId;
	});
	const active = $derived.by(() => {
		const found = _workspaces.find((w) => w.id === activeId);
		if (found) return found;
		return DEFAULT_WORKSPACE;
	});
	const count = $derived(_workspaces.length);

	function hydrate(workspaces: Workspace[], activeId: WorkspaceId): void {
		_workspaces = workspaces;
		// Verify if activeId exists in the hydrated list, otherwise fallback
		if (workspaces.find((w) => w.id === activeId)) {
			_activeId = activeId;
		} else if (workspaces.length > 0) {
			_activeId = workspaces[0].id;
		} else {
			_activeId = APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId;
		}
	}

	function setActive(id: WorkspaceId): void {
		_activeId = id;
		logger.info('Workspace changed', { workspaceId: id });
	}

	async function add(name: string): Promise<Result<Workspace, ApiError>> {
		const result = await repository.createWorkspace(name);

		if (result.ok) {
			_workspaces = [..._workspaces, result.value];
			return result;
		} else {
			logger.error('Failed to create workspace', result.error);
			return result;
		}
	}

	async function remove(id: WorkspaceId): Promise<void> {
		if (_workspaces.length <= 1) {
			logger.warn('Cannot remove the last workspace');
			return;
		}

		const previousWorkspaces = [..._workspaces];
		_workspaces = _workspaces.filter((w) => w.id !== id);

		const result = await repository.deleteWorkspace(id);
		if (!result.ok) {
			_workspaces = previousWorkspaces;
			logger.error(`Failed to delete workspace ${id}`, result.error);
		} else if (_activeId === id) {
			// If we deleted the active workspace, switch to another one
			setActive(_workspaces[0].id);
		}
	}

	return {
		get workspaces() {
			return workspaces;
		},
		get activeId() {
			return activeId;
		},
		get active() {
			return active;
		},
		get count() {
			return count;
		},
		hydrate,
		setActive,
		add,
		remove
	};
}
