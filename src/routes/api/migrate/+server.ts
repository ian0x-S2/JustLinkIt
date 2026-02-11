import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { links, workspaces, tags, linkTags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { Link, Workspace } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const { links: localLinks, workspaces: localWorkspaces } = await request.json();

	try {
		db.transaction((tx) => {
			// Ensure at least one workspace exists
			const existingWorkspaces = tx.select().from(workspaces).all();
			if (existingWorkspaces.length === 0 && (!localWorkspaces || localWorkspaces.length === 0)) {
				tx.insert(workspaces)
					.values({
						id: 'default',
						name: 'My Workspace',
						slug: 'my-workspace',
						createdAt: Date.now()
					})
					.run();
			}

			// Migrate Workspaces
			const workspaceIds = new Set<string>();
			if (localWorkspaces?.length) {
				for (const w of localWorkspaces as Workspace[]) {
					tx.insert(workspaces)
						.values({
							id: w.id,
							name: w.name,
							slug: w.slug,
							icon: w.icon,
							createdAt: w.createdAt
						})
						.onConflictDoNothing()
						.run();
					workspaceIds.add(w.id);
				}
			}

			// Ensure 'default' exists if any link references it
			if (!workspaceIds.has('default')) {
				tx.insert(workspaces)
					.values({
						id: 'default',
						name: 'My Workspace',
						slug: 'my-workspace',
						createdAt: Date.now()
					})
					.onConflictDoNothing()
					.run();
			}

			// Migrate Links and Tags
			if (localLinks?.length) {
				for (const l of localLinks as Link[]) {
					tx.insert(links)
						.values({
							id: l.id,
							workspaceId: l.workspaceId,
							url: l.url,
							title: l.title,
							description: l.description,
							image: l.image,
							author: l.author,
							publisher: l.publisher,
							logo: l.logo,
							createdAt: l.createdAt,
							updatedAt: l.updatedAt,
							isFavorite: l.isFavorite,
							isDeleted: l.isDeleted
						})
						.onConflictDoNothing()
						.run();

					if (l.tags?.length) {
						for (const tagName of l.tags) {
							// Insert tag if not exists
							const tagId = crypto.randomUUID();
							tx.insert(tags)
								.values({
									id: tagId,
									name: tagName
								})
								.onConflictDoNothing()
								.run();

							// Get tag ID (either new or existing)
							const [existingTag] = tx
								.select()
								.from(tags)
								.where(eq(tags.name, tagName))
								.limit(1)
								.all();
							const finalTagId = existingTag?.id || tagId;

							tx.insert(linkTags)
								.values({
									linkId: l.id,
									tagId: finalTagId
								})
								.onConflictDoNothing()
								.run();
						}
					}
				}
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Migration failed:', error);
		return json({ success: false, error: String(error) }, { status: 500 });
	}
};

