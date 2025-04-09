-- Create ENUM types first
CREATE TYPE ticket_status AS ENUM ('used', 'expired');
CREATE TYPE ticket_type AS ENUM ('rematching');

CREATE TABLE "articles" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"author_id" varchar(128) NOT NULL,
	"content" varchar(255) NOT NULL,
	"anonymous" varchar(15),
	"emoji" varchar(10),
	"like_count" integer DEFAULT 0 NOT NULL,
	"blinded_at" timestamp,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"author_id" varchar(36) NOT NULL,
	"post_id" varchar(36) NOT NULL,
	"content" varchar(255) NOT NULL,
	"nickname" varchar(15) NOT NULL,
	"emoji" varchar(10),
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"article_id" varchar(128) NOT NULL,
	"up" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"status" "ticket_status" NOT NULL,
	"type" "ticket_type" NOT NULL,
	"expired_at" timestamp,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tickets_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "universities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "universities" CASCADE;--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "male_user_id" TO "my_id";--> statement-breakpoint
ALTER TABLE "matches" RENAME COLUMN "female_user_id" TO "matcher_id";--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_male_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_female_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "s3_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "images" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "score" SET DATA TYPE numeric(8, 2);--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "score" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matching_requests" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "matching_requests" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matching_requests" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matching_requests" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pay_histories" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "display_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_options" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "multi_select" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "preference_types" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "image_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "image_order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "is_main" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profile_images" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "age" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "gender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reporter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "reported_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "university_details" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "university_details" ALTER COLUMN "authentication" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "university_details" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "university_details" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "user_preference_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "preference_option_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preference_options" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_range_preferences" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_range_preferences" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_range_preferences" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_range_preferences" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "deleted_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "type" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "pay_histories" ADD COLUMN "order_id" varchar(128);--> statement-breakpoint
ALTER TABLE "pay_histories" ADD COLUMN "order_name" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "pay_histories" ADD COLUMN "payment_key" varchar(128);--> statement-breakpoint
ALTER TABLE "pay_histories" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "preference_types" ADD COLUMN "maximum_choice_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "instagram_id" varchar(100);--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "post_id" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ADD COLUMN "user_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ADD COLUMN "university_name" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ADD COLUMN "department" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ADD COLUMN "grade" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "university_details" ADD COLUMN "student_number" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(10) DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_articles_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_my_id_users_id_fk" FOREIGN KEY ("my_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_matcher_id_users_id_fk" FOREIGN KEY ("matcher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_histories" ADD CONSTRAINT "pay_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_articles_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_details" ADD CONSTRAINT "university_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "error";--> statement-breakpoint
ALTER TABLE "university_details" DROP COLUMN "university_id";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id");