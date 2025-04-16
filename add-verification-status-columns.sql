-- Migration to add id_verified and face_verified columns to the users table
ALTER TABLE users
ADD COLUMN id_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN face_verified BOOLEAN DEFAULT FALSE;