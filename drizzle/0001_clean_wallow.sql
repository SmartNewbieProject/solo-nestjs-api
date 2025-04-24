ALTER TABLE "matches" ALTER COLUMN "my_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "published_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "direct" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "is_matching_enable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "rank" varchar(2) DEFAULT 'C';