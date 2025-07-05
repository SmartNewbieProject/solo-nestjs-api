-- Add birthday column to users table
-- This migration only adds the birthday column without affecting other columns

DO $$
BEGIN
    -- Check if birthday column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'birthday'
        AND table_schema = 'public'
    ) THEN
        -- Add birthday column if it doesn't exist
        ALTER TABLE "users" ADD COLUMN "birthday" varchar(10);
        RAISE NOTICE 'Birthday column added to users table';
    ELSE
        RAISE NOTICE 'Birthday column already exists in users table';
    END IF;
END $$;
