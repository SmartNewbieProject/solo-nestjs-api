ALTER TABLE "matches" ALTER COLUMN "my_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "direct" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_matching_enable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "rank" varchar(2) DEFAULT 'UNKNOWN';

ALTER TABLE "profiles" ALTER COLUMN "rank" SET DATA TYPE varchar(7);
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "rank" SET DEFAULT 'UNKNOWN';
--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "rank" SET NOT NULL;