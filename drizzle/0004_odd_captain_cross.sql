CREATE TABLE "sms_authorization" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"unique_key" varchar(62) NOT NULL,
	"authorization_code" varchar(12) NOT NULL,
	"is_authorized" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(16) NOT NULL;