import type { Workspace, WorkspaceId, Result, ApiError } from '$lib/types';
import { APP_CONFIG, DEFAULT_WORKSPACE } from '$lib/constants';
import type { Repository, Logger } from '../infra';

export interface CreateWorkspaceStoreOptions {
	repository: Repository;
	logger: Logger;
	initialWorkspaces?: Workspace[];
	initialActiveId?: WorkspaceId;
}

export interface WorkspaceStore {
	readonly workspaces: Workspace[];
	readonly activeId: WorkspaceId;
	readonly active: Workspace;
	readonly count: number;

	setActive(id: WorkspaceId): void;
	add(name: string): Promise<Result<Workspace, ApiError>>;
	remove(id: WorkspaceId): Promise<void>;
	rename(id: WorkspaceId, newName: string): Promise<Result<Workspace, ApiError>>;
	hydrate(workspaces: Workspace[], activeId: WorkspaceId): void;
}

export function createWorkspaceStore(options: CreateWorkspaceStoreOptions): WorkspaceStore {
	const { repository, logger, initialWorkspaces = [], initialActiveId } = options;

	let _workspaces = $state<Workspace[]>(initialWorkspaces);
	let _activeId = $state<WorkspaceId>(
		initialActiveId ?? (APP_CONFIG.DEFAULT_WORKSPACE_ID as WorkspaceId)
	);

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

	async function rename(id: WorkspaceId, newName: string): Promise<Result<Workspace, ApiError>> {
		const previousWorkspaces = [..._workspaces];
		const workspaceIndex = _workspaces.findIndex((w) => w.id === id);

		if (workspaceIndex === -1) {
			return { ok: false, error: { message: 'Workspace not found', status: 404 } };
		}

		// Optimistic update
		const updatedWorkspaces = [..._workspaces];
		updatedWorkspaces[workspaceIndex] = {
			...updatedWorkspaces[workspaceIndex],
			name: newName
		};
		_workspaces = updatedWorkspaces;

		const result = await repository.updateWorkspace(id, { name: newName });

		if (!result.ok) {
			_workspaces = previousWorkspaces;
			logger.error(`Failed to rename workspace ${id}`, result.error);
			return result;
		}

		// Update with actual server data (includes new slug etc)
		const finalWorkspaces = [..._workspaces];
		finalWorkspaces[workspaceIndex] = result.value;
		_workspaces = finalWorkspaces;

		return result;
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
		remove,
		rename
	};
}
