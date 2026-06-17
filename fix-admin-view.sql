-- Run this script in your Supabase SQL Editor to fix the Admin Users view

-- 1. Drop the existing view to recreate it with secure settings
DROP VIEW IF EXISTS public.admin_users_view;

-- 2. Create the view as a Security Definer (security_invoker = false) so it can read auth.users
-- We add a WHERE clause so ONLY admins can see the data (prevents data leaks to regular users)
CREATE VIEW public.admin_users_view WITH (security_invoker = false) AS
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
    auth.users u ON p.id = u.id
WHERE 
    -- Only return rows if the person querying is an admin
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';

-- 3. Grant access to authenticated users (the WHERE clause protects the data)
GRANT SELECT ON public.admin_users_view TO authenticated;
GRANT SELECT ON public.admin_users_view TO service_role;
