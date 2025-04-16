-- Add verification_link column to verification_requests table
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS verification_link TEXT;

-- Add verification_link column to users table (if not already exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_link TEXT;

