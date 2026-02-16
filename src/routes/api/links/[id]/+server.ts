import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { links, linkTags, tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	const updates = await request.json();
	const now = Date.now();

	const link = db
		.select({ workspaceId: links.workspaceId })
		.from(links)
		.where(eq(links.id, id))
		.get();
	const workspaceId = link?.workspaceId;

	db.transaction((tx) => {
		const linkUpdate: any = { ...updates, updatedAt: now };
		delete linkUpdate.tags; // Handle tags separately

		if (Object.keys(linkUpdate).length > 0) {
			tx.update(links).set(linkUpdate).where(eq(links.id, id)).run();
		}

		if (updates.tags !== undefined) {
			// Remove old tags
			tx.delete(linkTags).where(eq(linkTags.linkId, id)).run();

			// Add new tags
			for (const tagName of updates.tags) {
				tx.insert(tags)
					.values({ id: crypto.randomUUID(), name: tagName })
					.onConflictDoNothing()
					.run();
				const [tag] = tx.select().from(tags).where(eq(tags.name, tagName)).limit(1).all();
				if (tag) {
					tx.insert(linkTags).values({ linkId: id, tagId: tag.id }).onConflictDoNothing().run();
				}
			}
		}
	});

	cacheManager.invalidateLink(id, workspaceId);
	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	const link = db
		.select({ workspaceId: links.workspaceId })
		.from(links)
		.where(eq(links.id, id))
		.get();
	const workspaceId = link?.workspaceId;

	db.delete(links).where(eq(links.id, id)).run();
	cacheManager.invalidateLink(id, workspaceId);

	return json({ success: true });
};
