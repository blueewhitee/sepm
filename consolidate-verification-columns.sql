-- Consolidate verification columns
ALTER TABLE users
ADD COLUMN verified BOOLEAN DEFAULT FALSE;

-- If either id_verified or face_verified was true, set verified to true
UPDATE users
SET verified = (id_verified = TRUE OR face_verified = TRUE)
WHERE id_verified IS NOT NULL OR face_verified IS NOT NULL;

-- Drop the old columns
ALTER TABLE users
DROP COLUMN id_verified,
DROP COLUMN face_verified;
