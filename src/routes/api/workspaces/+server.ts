import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaces, links } from '$lib/server/db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import { generateSlug } from '$lib/utils';
import { defaultLogger } from '$lib/stores/infra/logger';
import * as v from 'valibot';
import type { RequestHandler } from './$types';

const WorkspaceSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	id: v.optional(v.string()),
	slug: v.optional(v.string()),
	icon: v.optional(v.nullable(v.string())),
	createdAt: v.optional(v.number())
});

export const GET: RequestHandler = async () => {
	const result = db
		.select({
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
		.orderBy(desc(workspaces.createdAt))
		.all();

	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const jsonBody = await request.json();
		const result = v.safeParse(WorkspaceSchema, jsonBody);

		if (!result.success) {
			return json({ error: 'Validation failed', details: result.issues }, { status: 400 });
		}

		const data = result.output;
		const id = data.id || crypto.randomUUID();
		const slug = data.slug || generateSlug(data.name, id);

		const newWorkspace = {
			id,
			name: data.name,
			slug,
			icon: data.icon ?? null,
			createdAt: data.createdAt || Date.now()
		};

		db.insert(workspaces).values(newWorkspace).run();
		cacheManager.clear();

		return json(newWorkspace);
	} catch (e) {
		defaultLogger.error('Failed to create workspace', { error: e });
		return json({ error: 'Failed to create workspace' }, { status: 500 });
	}
};
