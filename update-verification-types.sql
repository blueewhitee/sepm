-- Add 'check' to allowed verification types
ALTER TABLE verification_requests 
DROP CONSTRAINT IF EXISTS verification_requests_verification_type_check;

ALTER TABLE verification_requests 
ADD CONSTRAINT verification_requests_verification_type_check 
CHECK (verification_type IN ('id', 'face', 'check'));