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
CREATE TABLE "images" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"s3_url" varchar(255) NOT NULL,
	"s3_key" varchar(255),
	"original_filename" varchar(255),
	"mime_type" varchar(100),
	"size_in_bytes" integer,
	"is_verified" boolean DEFAULT false,
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
CREATE TABLE "matches" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"my_id" varchar(128),
	"matcher_id" varchar(128),
	"score" numeric(8, 2) NOT NULL,
	"published_at" timestamp with time zone,
	"type" varchar(30) NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "matching_requests" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128),
	"score" varchar(36),
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pay_histories" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"method" varchar(50),
	"order_id" varchar(128),
	"order_name" varchar(30) NOT NULL,
	"tx_id" varchar,
	"payment_key" varchar(128),
	"receipt_url" text,
	"paid_at" timestamp,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "preference_options" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"image_url" text,
	"preference_type_id" varchar(128),
	"value" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "preference_types" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"multi_select" boolean DEFAULT false NOT NULL,
	"maximum_choice_count" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "preference_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "profile_images" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"profile_id" varchar(36) NOT NULL,
	"image_id" varchar(36) NOT NULL,
	"image_order" integer NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"age" integer NOT NULL,
	"gender" varchar(10) NOT NULL,
	"name" varchar(15) NOT NULL,
	"title" varchar(100),
	"instagram_id" varchar(100),
	"introduction" varchar(255),
	"status_at" varchar(36),
	"university_detail_id" varchar(36),
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"post_id" varchar(128) NOT NULL,
	"reporter_id" varchar(128) NOT NULL,
	"reported_id" varchar(128) NOT NULL,
	"reason" varchar(255),
	"status" varchar(15),
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"status" varchar(10) NOT NULL,
	"type" varchar(10) NOT NULL,
	"expired_at" timestamp,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "university_details" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"university_name" varchar(30) NOT NULL,
	"department" varchar(30) NOT NULL,
	"authentication" boolean DEFAULT false NOT NULL,
	"grade" varchar(10) NOT NULL,
	"student_number" varchar(10) NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_preference_options" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_preference_id" varchar(36) NOT NULL,
	"preference_option_id" varchar(36) NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"distance_max" varchar(36),
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_range_preferences" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_preference_id" varchar(36),
	"preference_type_id" varchar(36),
	"min_value" integer,
	"max_value" integer,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(15) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"profile_id" varchar(36),
	"oauth_provider" varchar(30),
	"refresh_token" varchar(500),
	"role" varchar(10) DEFAULT 'user' NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_articles_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_my_id_users_id_fk" FOREIGN KEY ("my_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_matcher_id_users_id_fk" FOREIGN KEY ("matcher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pay_histories" ADD CONSTRAINT "pay_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_articles_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_id_users_id_fk" FOREIGN KEY ("reported_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_details" ADD CONSTRAINT "university_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;