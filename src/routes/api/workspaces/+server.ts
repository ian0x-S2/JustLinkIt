import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaces, links } from '$lib/server/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const result = await db.select({
		id: workspaces.id,
		name: workspaces.name,
		slug: workspaces.slug,
		icon: workspaces.icon,
		createdAt: workspaces.createdAt,
		linkCount: sql<number>`count(${links.id})`
	})
	.from(workspaces)
	.leftJoin(links, and(eq(workspaces.id, links.workspaceId), eq(links.isDeleted, false)))
	.groupBy(workspaces.id)
	.orderBy(desc(workspaces.createdAt));
	
	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		if (!data.name) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		const id = data.id || crypto.randomUUID();
		const slug = data.slug || data.name.toLowerCase().trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '') + '-' + id.slice(0, 5);
		
		const newWorkspace = {
			...data,
			id,
			slug,
			createdAt: data.createdAt || Date.now()
		};

		await db.insert(workspaces).values(newWorkspace);
		cacheManager.clear();
		
		return json(newWorkspace);
	} catch (e) {
		console.error('Failed to create workspace:', e);
		return json({ error: 'Failed to create workspace' }, { status: 500 });
	}
};
