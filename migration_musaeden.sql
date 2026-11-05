-- ==============================================================================
-- Migration: Musaedeen (Quran Listeners / Muhaffizeen Assistants) Table
-- SAFE MIGRATION: Creates a brand new table. Does NOT modify or touch any existing
-- students, fee_records, staff, or app_settings tables.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.musaeden (
  id text PRIMARY KEY,                          -- Format: MSD0001, MSD0002...
  password text NOT NULL,                       -- Bcrypt hashed password
  name text NOT NULL,
  its text UNIQUE NOT NULL,                     -- 8-digit ITS number
  gender text NOT NULL CHECK (gender IN ('Male', 'Female')),
  mobile text NOT NULL,
  email text,
  address text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by ITS or id during login
CREATE INDEX IF NOT EXISTS idx_musaeden_its ON public.musaeden(its);
CREATE INDEX IF NOT EXISTS idx_musaeden_status ON public.musaeden(status);

-- Disable Row Level Security to match the project's custom auth pattern
ALTER TABLE public.musaeden DISABLE ROW LEVEL SECURITY;

