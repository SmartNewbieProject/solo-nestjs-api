-- Add appearance_grade column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS appearance_grade varchar(15) DEFAULT 'UNCLASSIFIED';
