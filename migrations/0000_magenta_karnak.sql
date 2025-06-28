CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL
);
