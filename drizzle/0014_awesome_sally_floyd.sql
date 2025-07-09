ALTER TABLE "profiles" ADD COLUMN "universityId" varchar(128);
ALTER TABLE "university_info" ADD COLUMN "grade" varchar(10) NOT NULL;
ALTER TABLE "university_info" ADD COLUMN "student_number" varchar(10) NOT NULL;
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_universityId_university_info_id_fk" FOREIGN KEY ("universityId") REFERENCES "public"."university_info"("id") ON DELETE no action ON UPDATE no action;