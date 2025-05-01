ALTER TABLE "comments" ADD COLUMN "parent_id" varchar(36);--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "blinded_at" timestamp;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;