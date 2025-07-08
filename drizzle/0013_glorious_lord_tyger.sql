ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "profiles" ADD COLUMN "status_at" varchar(16);
ALTER TABLE "users" ADD COLUMN "birthday" varchar(10);
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;