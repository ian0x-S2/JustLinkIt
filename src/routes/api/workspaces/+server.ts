import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { workspaces } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { cacheManager } from '$lib/server/cache';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const result = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
	return json(result);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const id = data.id || crypto.randomUUID();
	
	const newWorkspace = {
		...data,
		id,
		createdAt: data.createdAt || Date.now()
	};

	await db.insert(workspaces).values(newWorkspace);
	cacheManager.clear(); // Nuclear option for simplicity on workspace changes
	
	return json(newWorkspace);
};
