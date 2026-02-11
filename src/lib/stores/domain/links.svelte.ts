import type { Link, LinkId, WorkspaceId, Result, ApiError } from '$lib/types';
import type { Repository, Logger } from '../infra';

export interface CreateLinkStoreOptions {
    repository: Repository;
    logger: Logger;
    initialLinks?: Link[];
}

export interface LinkStore {
    // Estado
    readonly links: Link[];

    // Ações
    add(linkData: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'> & { workspaceId?: WorkspaceId }): Promise<Result<Link, ApiError>>;
    update(id: LinkId, updates: Partial<Link>): Promise<void>;
    removePermanently(id: LinkId): Promise<void>;
    toggleFavorite(id: LinkId): Promise<void>;
    toggleDeleted(id: LinkId): Promise<void>;
    fetchForWorkspace(workspaceId: WorkspaceId): Promise<void>;
    hydrate(links: Link[]): void;
}

export function createLinkStore(options: CreateLinkStoreOptions): LinkStore {
    const { repository, logger, initialLinks = [] } = options;

    // Estado privado
    let _links = $state<Link[]>(initialLinks);

    // Estado público (readonly via getter)
    const links = $derived(_links);

    function hydrate(links: Link[]): void {
        _links = links;
    }

    async function fetchForWorkspace(workspaceId: WorkspaceId): Promise<void> {
        const result = await repository.fetchLinks(workspaceId);
        if (result.ok) {
            _links = result.value;
        } else {
            logger.error('Failed to load links', result.error);
        }
    }

    async function add(
        linkData: Omit<Link, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'> & { workspaceId?: WorkspaceId }
    ): Promise<Result<Link, ApiError>> {
        const tempId = crypto.randomUUID() as LinkId;
        const now = Date.now();

        const newLink: Link = {
            ...linkData,
            id: tempId,
            createdAt: now,
            updatedAt: now,
            isFavorite: false,
            isDeleted: false,
            tags: linkData.tags || []
        } as Link;

        // Optimistic update
        const previousLinks = [..._links];
        _links = [newLink, ..._links];

        const result = await repository.createLink(linkData);

        if (result.ok) {
            const idx = _links.findIndex((l) => l.id === tempId);
            if (idx !== -1) _links[idx] = result.value;
            return result;
        } else {
            // Rollback
            _links = previousLinks;
            logger.error('Add link failed', result.error);
            return result;
        }
    }

    async function update(id: LinkId, updates: Partial<Link>): Promise<void> {
        const index = _links.findIndex((l) => l.id === id);
        if (index === -1) return;

        const originalLink = { ..._links[index] };

        // Optimistic update - Replace the object to ensure reactivity
        _links[index] = {
            ..._links[index],
            ...updates,
            updatedAt: Date.now()
        };
        // Re-assign to trigger full reactivity if needed
        _links = [..._links];

        const result = await repository.updateLink(id, updates);
        if (!result.ok) {
            // Rollback
            _links = [..._links];
            const rollbackIdx = _links.findIndex(l => l.id === id);
            if (rollbackIdx !== -1) {
                _links[rollbackIdx] = originalLink;
                _links = [..._links];
            }
            logger.error(`Update failed for link ${id}`, result.error);
        }
    }

    async function removePermanently(id: LinkId): Promise<void> {
        const previousLinks = [..._links];
        _links = _links.filter((l) => l.id !== id);

        const result = await repository.deleteLink(id);
        if (!result.ok) {
            _links = previousLinks;
            logger.error(`Permanent removal failed for link ${id}`, result.error);
        }
    }

    async function toggleFavorite(id: LinkId): Promise<void> {
        const link = _links.find((l) => l.id === id);
        if (link) {
            await update(id, { isFavorite: !link.isFavorite });
        }
    }

    async function toggleDeleted(id: LinkId): Promise<void> {
        const link = _links.find((l) => l.id === id);
        if (link) {
            await update(id, { isDeleted: !link.isDeleted });
        }
    }

    return {
        get links() {
            return links;
        },
        hydrate,
        fetchForWorkspace,
        add,
        update,
        removePermanently,
        toggleFavorite,
        toggleDeleted
    };
}
