CREATE TABLE "departments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"university_id" varchar(128) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "universities" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"region" varchar NOT NULL,
	"code" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "universities_code_unique" UNIQUE("code")
);

CREATE TABLE "university_info" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"profile_id" varchar(128) NOT NULL,
	"university_id" varchar(128) NOT NULL,
	"department_id" varchar(128) NOT NULL,
	"verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "profiles" ADD COLUMN "status_at" varchar(16);
ALTER TABLE "users" ADD COLUMN "birthday" varchar(10);
ALTER TABLE "departments" ADD CONSTRAINT "departments_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "university_info" ADD CONSTRAINT "university_info_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "university_info" ADD CONSTRAINT "university_info_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "university_info" ADD CONSTRAINT "university_info_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;
