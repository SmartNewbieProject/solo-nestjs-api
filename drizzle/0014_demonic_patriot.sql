CREATE TABLE "version_updates" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"version" varchar(20) NOT NULL,
	"metadata" jsonb DEFAULT '{"description":["신규 버전"]}'::jsonb,
	"should_update" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now()
);
