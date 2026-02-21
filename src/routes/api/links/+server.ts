import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { links, linkTags, tags } from '$lib/server/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import { defaultLogger } from '$lib/stores/infra/logger';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import type { Link, LinkId, WorkspaceId } from '$lib/types';

function toLink(dbLink: any, tags: string[] = []): Link {
	return {
		...dbLink,
		id: dbLink.id as LinkId,
		workspaceId: dbLink.workspaceId as WorkspaceId,
		tags
	};
}

const LinkSchema = v.object({
	url: v.pipe(v.string(), v.url()),
	workspaceId: v.string(),
	title: v.optional(v.nullable(v.string())),
	description: v.optional(v.nullable(v.string())),
	image: v.optional(v.nullable(v.string())),
	author: v.optional(v.nullable(v.string())),
	publisher: v.optional(v.nullable(v.string())),
	logo: v.optional(v.nullable(v.string())),
	isFavorite: v.optional(v.boolean(), false),
	isDeleted: v.optional(v.boolean(), false),
	tags: v.optional(v.array(v.string()), [])
});

export const GET: RequestHandler = async ({ url }) => {
	const workspaceId = url.searchParams.get('workspaceId');
	const category = url.searchParams.get('category') || 'inbox';
	const fetchAll = url.searchParams.get('all') === 'true';

	if (!workspaceId) return json({ error: 'workspaceId required' }, { status: 400 });

	const cacheKey = fetchAll ? `ws:${workspaceId}:all` : `ws:${workspaceId}:cat:${category}`;
	const cachedIds = cacheManager.getCollection(cacheKey);

	if (cachedIds) {
		const cachedLinks = cachedIds.map((id) => cacheManager.getLink(id));
		const missingIds = cachedIds.filter((_, i) => !cachedLinks[i]);

		if (missingIds.length === 0) {
			return json(cachedLinks);
		}

		// Optimization: Only fetch missing links from DB
		const dbMissingLinks = db.select().from(links).where(inArray(links.id, missingIds)).all();

		// Update cache with missing links (they won't have tags here, but it's better than as any)
		dbMissingLinks.forEach((link) => cacheManager.setLink(toLink(link)));

		// Re-assemble result maintain order
		const linkMap = new Map(dbMissingLinks.map((l) => [l.id, l]));
		const result = cachedIds
			.map((id) => cacheManager.getLink(id) || linkMap.get(id))
			.filter(Boolean);

		return json(result);
	}

	let query = db.select().from(links).where(eq(links.workspaceId, workspaceId));

	if (!fetchAll) {
		if (category === 'inbox') {
			query = db
				.select()
				.from(links)
				.where(and(eq(links.workspaceId, workspaceId), eq(links.isDeleted, false)));
		} else if (category === 'favorites') {
			query = db
				.select()
				.from(links)
				.where(
					and(
						eq(links.workspaceId, workspaceId),
						eq(links.isFavorite, true),
						eq(links.isDeleted, false)
					)
				);
		} else if (category === 'trash') {
			query = db
				.select()
				.from(links)
				.where(and(eq(links.workspaceId, workspaceId), eq(links.isDeleted, true)));
		}
	}

	const dbLinks = query.orderBy(desc(links.createdAt)).all();
	const linkIds = dbLinks.map((l) => l.id);

	let linksWithTags: Link[] = dbLinks.map((link) => toLink(link));

	if (linkIds.length > 0) {
		const tagsData = db
			.select({
				linkId: linkTags.linkId,
				tagName: tags.name
			})
			.from(linkTags)
			.innerJoin(tags, eq(linkTags.tagId, tags.id))
			.where(inArray(linkTags.linkId, linkIds))
			.all();

		const tagsByLinkId = tagsData.reduce(
			(acc, curr) => {
				if (!acc[curr.linkId]) acc[curr.linkId] = [];
				acc[curr.linkId].push(curr.tagName);
				return acc;
			},
			{} as Record<string, string[]>
		);

		linksWithTags = dbLinks.map((link) => toLink(link, tagsByLinkId[link.id] || []));

		// Cache the full results
		linksWithTags.forEach((link) => cacheManager.setLink(link));
		cacheManager.setCollection(cacheKey, linkIds);
	}

	return json(linksWithTags);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const result = v.safeParse(LinkSchema, jsonBody);

		if (!result.success) {
			return json({ error: 'Validation failed', details: result.issues }, { status: 400 });
		}

		const data = result.output;
		const id = crypto.randomUUID();
		const now = Date.now();

		const newLink = {
			id,
			workspaceId: data.workspaceId,
			url: data.url,
			title: data.title ?? null,
			description: data.description ?? null,
			image: data.image ?? null,
			author: data.author ?? null,
			publisher: data.publisher ?? null,
			logo: data.logo ?? null,
			createdAt: now,
			updatedAt: now,
			isFavorite: data.isFavorite ?? false,
			isDeleted: data.isDeleted ?? false
		};

		db.transaction((tx) => {
			tx.insert(links).values(newLink).run();

			if (data.tags && data.tags.length > 0) {
				for (const tagName of data.tags) {
					tx.insert(tags)
						.values({ id: crypto.randomUUID(), name: tagName })
						.onConflictDoNothing()
						.run();
					const tag = tx.select().from(tags).where(eq(tags.name, tagName)).get();
					if (tag) {
						tx.insert(linkTags).values({ linkId: id, tagId: tag.id }).onConflictDoNothing().run();
					}
				}
			}
		});

		const fullLink = toLink(newLink, data.tags || []);
		cacheManager.setLink(fullLink);
		cacheManager.invalidateWorkspace(data.workspaceId);

		return json(fullLink);
	} catch (error: any) {
		defaultLogger.error('Failed to create link', { error });
		return json({ error: 'Internal server error', details: error.message }, { status: 500 });
	}
};
