import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const workspaces = sqliteTable('workspaces', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	icon: text('icon'),
	createdAt: integer('created_at').notNull()
});

export const links = sqliteTable(
	'links',
	{
		id: text('id').primaryKey(),
		workspaceId: text('workspace_id')
			.notNull()
			.references(() => workspaces.id, { onDelete: 'cascade' }),
		url: text('url').notNull(),
		title: text('title'),
		description: text('description'),
		image: text('image'),
		author: text('author'),
		publisher: text('publisher'),
		logo: text('logo'),
		createdAt: integer('created_at').notNull(),
		updatedAt: integer('updated_at').notNull(),
		isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
		isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
		isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false)
	},
	(table) => ({
		workspaceCategoryIdx: index('idx_links_workspace_category').on(
			table.workspaceId,
			table.isDeleted,
			table.isArchived,
			table.createdAt
		),
		favoriteIdx: index('idx_links_fav')
			.on(table.workspaceId, table.createdAt)
			.where(sql`is_favorite = 1 AND is_deleted = 0`)
	})
);

export const tags = sqliteTable('tags', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique()
});

export const linkTags = sqliteTable(
	'link_tags',
	{
		linkId: text('link_id')
			.notNull()
			.references(() => links.id, { onDelete: 'cascade' }),
		tagId: text('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.linkId, table.tagId] }),
		tagIdx: index('idx_link_tags_tag_id').on(table.tagId)
	})
);
