-- ============================================================
-- GetURQR: User Features Migration
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1. Self-Destructing Tags
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- 2. Custom QR Design (Premium)
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS qr_color    text DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS qr_bg_color text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS qr_logo_url text;

-- 3. Emergency Contacts (for Lost Mode Broadcast)
ALTER TABLE public.tags
  ADD COLUMN IF NOT EXISTS emergency_contacts jsonb DEFAULT '[]'::jsonb;

-- 4. Premium flag on user profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
