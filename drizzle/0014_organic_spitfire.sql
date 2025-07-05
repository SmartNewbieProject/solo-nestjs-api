CREATE TABLE "additional_preferences" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"good_mbti" varchar(4),
	"bad_mbti" varchar(4),
	"profile_id" varchar NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "additional_preferences_profile_id_unique" UNIQUE("profile_id")
);

ALTER TABLE "additional_preferences" ADD CONSTRAINT "additional_preferences_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;