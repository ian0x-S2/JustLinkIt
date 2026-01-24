import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { links, linkTags, tags } from '$lib/server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const workspaceId = url.searchParams.get('workspaceId');
	const category = url.searchParams.get('category') || 'inbox';

	if (!workspaceId) return json({ error: 'workspaceId required' }, { status: 400 });

	const cacheKey = `ws:${workspaceId}:cat:${category}`;
	const cachedIds = cacheManager.getCollection(cacheKey);

	if (cachedIds) {
		const result = cachedIds.map(id => cacheManager.getLink(id)).filter(Boolean);
		if (result.length === cachedIds.length) {
			return json(result);
		}
	}

	let query = db.select().from(links).where(eq(links.workspaceId, workspaceId));

	if (category === 'inbox') {
		query = db.select().from(links).where(
			and(
				eq(links.workspaceId, workspaceId),
				eq(links.isArchived, false),
				eq(links.isDeleted, false)
			)
		);
	} else if (category === 'favorites') {
		query = db.select().from(links).where(
			and(
				eq(links.workspaceId, workspaceId),
				eq(links.isFavorite, true),
				eq(links.isDeleted, false)
			)
		);
	} else if (category === 'archive') {
		query = db.select().from(links).where(
			and(
				eq(links.workspaceId, workspaceId),
				eq(links.isArchived, true),
				eq(links.isDeleted, false)
			)
		);
	} else if (category === 'trash') {
		query = db.select().from(links).where(
			and(
				eq(links.workspaceId, workspaceId),
				eq(links.isDeleted, true)
			)
		);
	}

	const dbLinks = await query.orderBy(desc(links.createdAt));

	// Fetch tags for these links
	const linkIds = dbLinks.map(l => l.id);
	const tagsData = await db.select({
		linkId: linkTags.linkId,
		tagName: tags.name
	})
	.from(linkTags)
	.innerJoin(tags, eq(linkTags.tagId, tags.id))
	.where(sql`${linkTags.linkId} IN ${linkIds.length ? linkIds : ['']}`);

	const linksWithTags = dbLinks.map(link => ({
		...link,
		tags: tagsData.filter(t => t.linkId === link.id).map(t => t.tagName)
	}));

	// Update cache
	linksWithTags.forEach(l => cacheManager.setLink(l as any));
	cacheManager.setCollection(cacheKey, linkIds);

	return json(linksWithTags);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const id = crypto.randomUUID();
	const now = Date.now();

	const newLink = {
		...data,
		id,
		createdAt: now,
		updatedAt: now,
		isFavorite: data.isFavorite || false,
		isArchived: data.isArchived || false,
		isDeleted: data.isDeleted || false
	};

	try {
		db.transaction((tx) => {
			tx.insert(links).values({
				id: newLink.id,
				workspaceId: newLink.workspaceId,
				url: newLink.url,
				title: newLink.title,
				description: newLink.description,
				image: newLink.image,
				author: newLink.author,
				publisher: newLink.publisher,
				logo: newLink.logo,
				createdAt: newLink.createdAt,
				updatedAt: newLink.updatedAt,
				aiSummary: newLink.aiSummary,
				isFavorite: newLink.isFavorite,
				isArchived: newLink.isArchived,
				isDeleted: newLink.isDeleted
			}).run();

			if (data.tags?.length) {
				for (const tagName of data.tags) {
					tx.insert(tags).values({ id: crypto.randomUUID(), name: tagName }).onConflictDoNothing().run();
					const [tag] = tx.select().from(tags).where(eq(tags.name, tagName)).limit(1).all();
					if (tag) {
						tx.insert(linkTags).values({ linkId: id, tagId: tag.id }).onConflictDoNothing().run();
					}
				}
			}
		});
	} catch (error) {
		console.error('Failed to create link:', error);
		return json({ error: 'Failed to create link. Make sure the workspace exists.' }, { status: 500 });
	}

	cacheManager.invalidateLink(id);
	return json({ ...newLink, tags: data.tags || [] });
};
