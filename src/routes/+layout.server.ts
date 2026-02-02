import { db } from '$lib/server/db';
import { workspaces, links, linkTags, tags } from '$lib/server/db/schema';
import { eq, desc,  sql } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { SIDEBAR_COOKIE_NAME } from '$lib/components/ui/sidebar/constants';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// 1. Get workspaces with link counts
	const allWorkspaces = db.select({
		id: workspaces.id,
		name: workspaces.name,
		slug: workspaces.slug,
		createdAt: workspaces.createdAt,
		linkCount: sql<number>`count(${links.id})`
	})
	.from(workspaces)
	.leftJoin(links, eq(workspaces.id, links.workspaceId))
	.groupBy(workspaces.id)
	.orderBy(desc(workspaces.createdAt))
	.all();
	
	// Ensure at least one workspace exists
	if (allWorkspaces.length === 0) {
		const newWsData = {
			id: 'default',
			name: 'My Workspace',
			slug: 'my-workspace',
			createdAt: 1700000000000 // Fixed timestamp for hydration consistency
		};
		db.insert(workspaces).values(newWsData).run();
		allWorkspaces.push({ ...newWsData, linkCount: 0 });
	}

	let activeWorkspaceId = cookies.get('active_workspace_id');
	
	// Validate that the active workspace still exists
	if (!activeWorkspaceId || !allWorkspaces.find(w => w.id === activeWorkspaceId)) {
		activeWorkspaceId = allWorkspaces[0].id;
	}

	const viewMode = (cookies.get('view_mode') as 'list' | 'grid') || 'list';

	const sidebarState = cookies.get(SIDEBAR_COOKIE_NAME);
	const isSidebarOpen = sidebarState ? sidebarState === 'true' : true;

	// 2. Get ALL links for the active workspace (to allow SPA-like instant filtering)
	const dbLinks = db.select().from(links).where(
		eq(links.workspaceId, activeWorkspaceId)
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
		activeWorkspaceId,
		viewMode,
		isSidebarOpen
	};
};