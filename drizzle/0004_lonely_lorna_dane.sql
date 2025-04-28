CREATE TABLE "article_categories" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"emoji_url" text NOT NULL,
	"name" varchar(20) NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "category_id" varchar(128);--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "read_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_article_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."article_categories"("id") ON DELETE no action ON UPDATE no action;