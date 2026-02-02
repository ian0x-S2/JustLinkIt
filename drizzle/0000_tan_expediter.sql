CREATE TABLE `link_tags` (
	`link_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`link_id`, `tag_id`),
	FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_link_tags_tag_id` ON `link_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`description` text,
	`image` text,
	`author` text,
	`publisher` text,
	`logo` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`is_favorite` integer DEFAULT false,
	`is_archived` integer DEFAULT false,
	`is_deleted` integer DEFAULT false,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_links_workspace_category` ON `links` (`workspace_id`,`is_deleted`,`is_archived`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_links_fav` ON `links` (`workspace_id`,`created_at`) WHERE is_favorite = 1 AND is_deleted = 0;--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_slug_unique` ON `workspaces` (`slug`);