import { db } from '$lib/server/db';
import { workspaces, links, linkTags, tags } from '$lib/server/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// 1. Get workspaces
	const allWorkspaces = db.select().from(workspaces).orderBy(desc(workspaces.createdAt)).all();
	
	// Ensure at least one workspace exists
	if (allWorkspaces.length === 0) {
		const newWs = {
			id: 'default',
			name: 'My Workspace',
			slug: 'my-workspace',
			createdAt: Date.now()
		};
		db.insert(workspaces).values(newWs).run();
		allWorkspaces.push(newWs);
	}

	const activeWorkspaceId = cookies.get('active_workspace_id') || allWorkspaces[0].id;

	// 2. Get initial links for the active workspace (Inbox)
	const dbLinks = db.select().from(links).where(
		and(
			eq(links.workspaceId, activeWorkspaceId),
			eq(links.isArchived, false),
			eq(links.isDeleted, false)
		)
	).orderBy(desc(links.createdAt)).all();

	// 3. Get tags for these links
	const linkIds = dbLinks.map(l => l.id);
	const tagsData = db.select({
		linkId: linkTags.linkId,
		tagName: tags.name
	})
	.from(linkTags)
	.innerJoin(tags, eq(linkTags.tagId, tags.id))
	.where(sql`${linkTags.linkId} IN ${linkIds.length ? linkIds : ['']}`)
	.all();

	const linksWithTags = dbLinks.map(link => ({
		...link,
		tags: tagsData.filter(t => t.linkId === link.id).map(t => t.tagName)
	}));

	return {
		workspaces: allWorkspaces,
		links: linksWithTags,
		activeWorkspaceId
	};
};
