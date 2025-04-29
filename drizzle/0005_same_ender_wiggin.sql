CREATE TABLE "hot_articles" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"article_id" varchar(128) NOT NULL,
	"curator_comment" varchar(255),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

CREATE TYPE withdrawal_reason_type AS ENUM (
  'FOUND_PARTNER',
  'POOR_MATCHING',
  'PRIVACY_CONCERN',
  'SAFETY_CONCERN',
  'TECHNICAL_ISSUES',
  'INACTIVE_USAGE',
  'DISSATISFIED_SERVICE',
  'OTHER'
);

--> statement-breakpoint
CREATE TABLE "withdrawal_reasons" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"reason" "withdrawal_reason_type" NOT NULL,
	"detail" text,
	"withdrawn_at" timestamp NOT NULL,
	"service_duration_days" integer NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "article_categories" RENAME COLUMN "name" TO "display_name";--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "article_categories" ADD COLUMN "code" varchar(15) NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "title" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "hot_articles" ADD CONSTRAINT "hot_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "emoji";
