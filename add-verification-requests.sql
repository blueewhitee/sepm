-- Add is_blocked column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('id', 'face')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  additional_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,

  -- Creating index on user_id for faster lookups
  CONSTRAINT idx_verification_requests_user_id UNIQUE (user_id, verification_type, status)
);

-- Create function to prevent multiple pending requests of the same type
CREATE OR REPLACE FUNCTION check_verification_request() 
RETURNS TRIGGER AS $$
BEGIN
  -- If there's already a pending request of the same type for the same user, reject
  IF EXISTS (
    SELECT 1 FROM verification_requests 
    WHERE user_id = NEW.user_id 
    AND verification_type = NEW.verification_type 
    AND status = 'pending'
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'A pending verification request of this type already exists for this user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the above rule
CREATE TRIGGER verification_request_check
BEFORE INSERT OR UPDATE ON verification_requests
FOR EACH ROW
EXECUTE FUNCTION check_verification_request();