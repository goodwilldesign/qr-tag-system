-- ============================================================
-- GetURQR: Admin Tools Migration
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1. Add is_suspended column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- 2. Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','flat')),
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  max_uses      integer,
  uses_count    integer NOT NULL DEFAULT 0,
  expires_at    timestamptz,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage promo_codes" ON public.promo_codes;
CREATE POLICY "Admins manage promo_codes"
  ON public.promo_codes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Create broadcast_messages table
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  body             text NOT NULL,
  type             text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success')),
  recipient_count  integer NOT NULL DEFAULT 0,
  sent_at          timestamptz NOT NULL DEFAULT now(),
  sent_by          uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage broadcasts" ON public.broadcast_messages;
CREATE POLICY "Admins manage broadcasts"
  ON public.broadcast_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
