CREATE TABLE `pilot_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`consent` integer NOT NULL,
	`notice_version` text NOT NULL,
	`created_at` text NOT NULL
);
