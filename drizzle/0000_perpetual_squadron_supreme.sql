CREATE TABLE `snippets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`file_path` text NOT NULL,
	`language` text NOT NULL,
	`tags` text,
	`description` text,
	`is_favorite` integer DEFAULT false,
	`created_at` integer
);
