import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaces } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;
	if (!id) return json({ error: 'id required' }, { status: 400 });

	await db.delete(workspaces).where(eq(workspaces.id, id));
	cacheManager.clear();

	return json({ success: true });
};
