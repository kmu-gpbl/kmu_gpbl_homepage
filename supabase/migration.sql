-- Migration script to add certifications column to existing users table
-- Run this in Supabase SQL Editor

-- Add certifications column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'certifications'
  ) THEN
    ALTER TABLE users ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'certifications column added successfully';
  ELSE
    RAISE NOTICE 'certifications column already exists';
  END IF;
END $$;

-- Add resume fields if they don't exist
DO $$ 
BEGIN
  -- Add resume_url column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE users ADD COLUMN resume_url TEXT;
    RAISE NOTICE 'resume_url column added successfully';
  ELSE
    RAISE NOTICE 'resume_url column already exists';
  END IF;

  -- Add resume_file_name column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'resume_file_name'
  ) THEN
    ALTER TABLE users ADD COLUMN resume_file_name TEXT;
    RAISE NOTICE 'resume_file_name column added successfully';
  ELSE
    RAISE NOTICE 'resume_file_name column already exists';
  END IF;
END $$;

-- Add badges field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'badges'
  ) THEN
    ALTER TABLE users ADD COLUMN badges TEXT[] DEFAULT '{}';
    RAISE NOTICE 'badges column added successfully';
  ELSE
    RAISE NOTICE 'badges column already exists';
  END IF;
END $$;

-- Update existing users to have empty certifications array if null
UPDATE users 
SET certifications = '[]'::jsonb 
WHERE certifications IS NULL;

-- Update existing users to have empty badges array if null
UPDATE users 
SET badges = '{}' 
WHERE badges IS NULL;

-- Add index for better performance on certifications queries
CREATE INDEX IF NOT EXISTS idx_users_certifications ON users USING GIN(certifications);

-- Add index for badges
CREATE INDEX IF NOT EXISTS idx_users_badges ON users USING GIN(badges);

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name IN ('certifications', 'resume_url', 'resume_file_name', 'badges'); 