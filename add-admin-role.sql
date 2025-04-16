-- Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Reset all admin privileges first
UPDATE users SET is_admin = FALSE;

-- Set admin privileges for the admin@urban.couch user
UPDATE users SET is_admin = TRUE WHERE email = 'admin@urban.couch';