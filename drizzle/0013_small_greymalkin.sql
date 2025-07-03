CREATE TYPE preference_target AS ENUM ('PARTNER', 'SELF');
ALTER TABLE "user_preference_options" ADD COLUMN "preference_target" "preference_target" DEFAULT 'PARTNER' NOT NULL;
