ALTER TABLE "profiles" ADD COLUMN "mbti" varchar(4);
ALTER TABLE "profiles" DROP COLUMN "status_at";

ALTER TABLE "profiles" ADD COLUMN "status_at" varchar(16);