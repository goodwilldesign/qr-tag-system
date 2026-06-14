-- Run this script in the Supabase SQL Editor to fix the User Management page

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

-- 2. Create the admin_users_view to join profiles with auth.users (to get email)
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    p.id,
    p.full_name,
    p.whatsapp_number,
    p.created_at,
    p.updated_at,
    p.role,
    p.is_suspended,
    u.email
FROM 
    public.profiles p
JOIN 
    auth.users u ON p.id = u.id;

-- 3. Grant access to the view
GRANT SELECT ON public.admin_users_view TO authenticated;
GRANT SELECT ON public.admin_users_view TO service_role;

-- 4. Make sure policies allow admins to update profiles (role, is_suspended)
-- Drop existing update policy to recreate it
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile or admins can update" 
  ON public.profiles FOR UPDATE 
  USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 5. Give yourself admin rights (Replace with your actual email)
-- UPDATE public.profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
