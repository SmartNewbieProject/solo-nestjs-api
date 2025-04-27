ALTER TABLE "profiles" ALTER COLUMN "rank" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "rank" SET DEFAULT 'UNKNOWN';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "rank" SET NOT NULL;