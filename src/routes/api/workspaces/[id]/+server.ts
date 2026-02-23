import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaces } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import { generateSlug } from '$lib/utils';
import * as v from 'valibot';
import type { RequestHandler } from './$types';

const UpdateWorkspaceSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1))
});

export const PATCH: RequestHandler = async ({ params, request }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	try {
		const jsonBody = await request.json();
		const result = v.safeParse(UpdateWorkspaceSchema, jsonBody);

		if (!result.success) {
			return json({ error: 'Validation failed', details: result.issues }, { status: 400 });
		}

		const { name } = result.output;
		const slug = generateSlug(name, id);

		const updated = db
			.update(workspaces)
			.set({ name, slug })
			.where(eq(workspaces.id, id))
			.returning()
			.get();

		if (!updated) {
			return json({ error: 'Workspace not found' }, { status: 404 });
		}

		cacheManager.clear();
		return json(updated);
	} catch (e) {
		return json({ error: 'Failed to update workspace' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	await db.delete(workspaces).where(eq(workspaces.id, id));
	cacheManager.clear();

	return json({ success: true });
};
