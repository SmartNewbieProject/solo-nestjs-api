CREATE TABLE "matching_failure_logs" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"reason" text NOT NULL,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);

ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp;
ALTER TABLE "matching_failure_logs" ADD CONSTRAINT "matching_failure_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "comments" DROP COLUMN "emoji";