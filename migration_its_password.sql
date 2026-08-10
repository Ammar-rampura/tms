-- Migration to add ITS Password
-- This adds an informational-only field for the student's ITS account password
-- It does NOT affect ERP login, authentication, or existing passwords.

ALTER TABLE students
ADD COLUMN IF NOT EXISTS its_password TEXT;
