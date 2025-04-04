CREATE TABLE "images" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-358b-7642-9553-e970e4eb79ae' NOT NULL,
	"s3_url" varchar(255),
	"s3_key" varchar(255),
	"original_filename" varchar(255),
	"mime_type" varchar(100),
	"size_in_bytes" integer,
	"is_verified" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3591-7f81-9ca4-55971139f5da' NOT NULL,
	"error" varchar(255),
	"male_user_id" varchar(128),
	"female_user_id" varchar(128),
	"score" varchar(36),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "matching_requests" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3593-7fcf-bae0-45fd1201c7f5' NOT NULL,
	"user_id" varchar(128),
	"score" varchar(36),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pay_histories" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3584-79ca-846f-f31301b12a00' NOT NULL,
	"amount" integer,
	"user_id" varchar(128),
	"method" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "preference_options" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3582-7ff5-9eaa-a849c1e0086e' NOT NULL,
	"preference_type_id" varchar(128),
	"value" varchar(100),
	"display_name" varchar(100),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "preference_types" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3580-7929-93cc-f36ee19930dd' NOT NULL,
	"code" varchar(50),
	"name" varchar(100),
	"multi_select" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "preference_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "profile_images" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-358d-79f3-8adc-5d862cd79329' NOT NULL,
	"profile_id" varchar(36),
	"image_id" varchar(36),
	"image_order" integer,
	"is_main" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-357d-7748-b895-682eee2853a7' NOT NULL,
	"user_id" varchar(128),
	"age" integer,
	"gender" varchar(10),
	"name" varchar(15),
	"title" varchar(100),
	"introduction" varchar(255),
	"status_at" varchar(36),
	"university_detail_id" varchar(36),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3595-7da3-b24e-4fefaebdf283' NOT NULL,
	"reporter_id" varchar(128),
	"reported_id" varchar(128),
	"reason" varchar(255),
	"status" varchar(15),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3587-7020-9c8d-cd529cd602bc' NOT NULL,
	"name" varchar(30),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "university_details" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3589-7fc2-b966-26bf24e92c90' NOT NULL,
	"university_id" varchar(36),
	"authentication" boolean DEFAULT false,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_preference_options" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3597-7b5c-ae3b-16acb1d8fefa' NOT NULL,
	"user_preference_id" varchar(36),
	"preference_option_id" varchar(36),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-358f-7b27-a21b-4c26c1e5b501' NOT NULL,
	"user_id" varchar(36),
	"distance_max" varchar(36),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_range_preferences" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-3599-7a8b-9b36-ded3c027490a' NOT NULL,
	"user_preference_id" varchar(36),
	"preference_type_id" varchar(36),
	"min_value" integer,
	"max_value" integer,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY DEFAULT '019600d2-357a-7aca-8224-c3be41e08348' NOT NULL,
	"name" varchar(15) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"profile_id" varchar(36),
	"oauth_provider" varchar(30),
	"refresh_token" varchar(500),
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_male_user_id_users_id_fk" FOREIGN KEY ("male_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_female_user_id_users_id_fk" FOREIGN KEY ("female_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;