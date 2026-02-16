import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { links, linkTags, tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import { defaultLogger } from '$lib/stores/infra/logger';
import * as v from 'valibot';
import type { RequestHandler } from './$types';

const UpdateLinkSchema = v.object({
	url: v.optional(v.pipe(v.string(), v.url())),
	title: v.optional(v.nullable(v.string())),
	description: v.optional(v.nullable(v.string())),
	image: v.optional(v.nullable(v.string())),
	author: v.optional(v.nullable(v.string())),
	publisher: v.optional(v.nullable(v.string())),
	logo: v.optional(v.nullable(v.string())),
	isFavorite: v.optional(v.boolean()),
	isDeleted: v.optional(v.boolean()),
	tags: v.optional(v.array(v.string()))
});

export const PATCH: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	try {
		const jsonBody = await request.json();
		const result = v.safeParse(UpdateLinkSchema, jsonBody);

		if (!result.success) {
			return json({ error: 'Validation failed', details: result.issues }, { status: 400 });
		}

		const updates = result.output;
		const now = Date.now();

		const link = db
			.select({ workspaceId: links.workspaceId })
			.from(links)
			.where(eq(links.id, id))
			.get();
		
		if (!link) return json({ error: 'Link not found' }, { status: 404 });
		
		const workspaceId = link.workspaceId;

		db.transaction((tx) => {
			const { tags: tagsToUpdate, ...linkUpdate } = updates;
			
			if (Object.keys(linkUpdate).length > 0) {
				tx.update(links)
					.set({ ...linkUpdate, updatedAt: now } as any)
					.where(eq(links.id, id))
					.run();
			}

			if (tagsToUpdate !== undefined) {
				// Remove old tags
				tx.delete(linkTags).where(eq(linkTags.linkId, id)).run();

				// Add new tags
				for (const tagName of tagsToUpdate) {
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

		cacheManager.invalidateLink(id, workspaceId);
		return json({ success: true });
	} catch (error) {
		defaultLogger.error('Failed to update link', { error, id });
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	try {
		const link = db
			.select({ workspaceId: links.workspaceId })
			.from(links)
			.where(eq(links.id, id))
			.get();
		
		if (!link) return json({ error: 'Link not found' }, { status: 404 });
		
		const workspaceId = link.workspaceId;

		db.delete(links).where(eq(links.id, id)).run();
		cacheManager.invalidateLink(id, workspaceId);

		return json({ success: true });
	} catch (error) {
		defaultLogger.error('Failed to delete link', { error, id });
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
