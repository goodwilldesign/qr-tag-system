-- ==============================================================================
-- Pre-Generated / Unclaimed QR Tag Activation System Migration
-- ==============================================================================

-- 1. Make user_id nullable to allow pre-printed tags before assignment
ALTER TABLE public.tags ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add columns for claiming and batch management
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT true;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS claim_code TEXT DEFAULT NULL;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS batch_id TEXT DEFAULT NULL;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ensure all existing user-created tags are marked as claimed
UPDATE public.tags SET is_claimed = true WHERE user_id IS NOT NULL AND (is_claimed IS NULL OR is_claimed = false);

-- 3. Atomic RPC function to claim a tag
CREATE OR REPLACE FUNCTION public.claim_tag(
  p_tag_id UUID,
  p_title TEXT,
  p_type TEXT,
  p_claim_code TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tag RECORD;
  v_user_id UUID;
  v_clean_title TEXT;
BEGIN
  -- 1. Check user authentication
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in to claim a tag.';
  END IF;

  -- 2. Fetch the target tag
  SELECT * INTO v_tag FROM public.tags WHERE id = p_tag_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tag not found.';
  END IF;

  -- 3. Check if already claimed
  IF v_tag.is_claimed = true AND v_tag.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'This tag has already been claimed by another user.';
  END IF;

  -- 4. Check claim code if required by the tag
  IF v_tag.claim_code IS NOT NULL AND TRIM(v_tag.claim_code) <> '' THEN
    IF p_claim_code IS NULL OR UPPER(TRIM(p_claim_code)) <> UPPER(TRIM(v_tag.claim_code)) THEN
      RAISE EXCEPTION 'Invalid claim activation code.';
    END IF;
  END IF;

  -- 5. Prepare title
  v_clean_title := TRIM(p_title);
  IF v_clean_title IS NULL OR v_clean_title = '' THEN
    v_clean_title := 'My ' || INITCAP(p_type) || ' Tag';
  END IF;

  -- 6. Atomically claim and activate tag
  UPDATE public.tags
  SET 
    user_id = v_user_id,
    title = v_clean_title,
    type = p_type,
    is_claimed = true,
    is_active = true,
    claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_tag_id;

  RETURN jsonb_build_object(
    'success', true,
    'tag_id', p_tag_id,
    'user_id', v_user_id,
    'title', v_clean_title,
    'type', p_type
  );
END;
$$;

-- 4. Admin RPC function to generate a batch of pre-printed tags
CREATE OR REPLACE FUNCTION public.generate_tag_batch(
  p_count INT,
  p_batch_id TEXT,
  p_default_type TEXT DEFAULT 'dog',
  p_require_claim_code BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role TEXT;
  v_new_id UUID;
  v_code TEXT;
  v_batch_clean TEXT;
  i INT;
  v_inserted_count INT := 0;
BEGIN
  -- Verify caller is admin
  SELECT role INTO v_admin_role FROM public.profiles WHERE id = auth.uid();
  IF v_admin_role IS NULL OR v_admin_role <> 'admin' THEN
    RAISE EXCEPTION 'Only administrators can generate batches of tags.';
  END IF;

  IF p_count < 1 OR p_count > 500 THEN
    RAISE EXCEPTION 'Batch count must be between 1 and 500.';
  END IF;

  v_batch_clean := TRIM(p_batch_id);
  IF v_batch_clean IS NULL OR v_batch_clean = '' THEN
    v_batch_clean := 'BATCH-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MI');
  END IF;

  FOR i IN 1..p_count LOOP
    v_new_id := gen_random_uuid();
    v_code := CASE WHEN p_require_claim_code THEN UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 6)) ELSE NULL END;

    INSERT INTO public.tags (
      id,
      user_id,
      title,
      type,
      data,
      is_claimed,
      is_active,
      batch_id,
      claim_code
    ) VALUES (
      v_new_id,
      NULL,
      'Unclaimed Tag #' || SUBSTRING(v_new_id::TEXT FROM 1 FOR 8),
      p_default_type,
      '{}'::jsonb,
      false,
      true,
      v_batch_clean,
      v_code
    );

    v_inserted_count := v_inserted_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'batch_id', v_batch_clean,
    'count', v_inserted_count
  );
END;
$$;

-- 5. Atomic function to delete (or safely unlink/reset physical pre-printed tags)
CREATE OR REPLACE FUNCTION public.delete_or_reset_tag(p_tag_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_tag RECORD;
  v_is_admin BOOLEAN := false;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be logged in.';
  END IF;

  SELECT * INTO v_tag FROM public.tags WHERE id = p_tag_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tag not found.';
  END IF;

  SELECT (role = 'admin') INTO v_is_admin FROM public.profiles WHERE id = v_user_id;

  IF v_tag.user_id <> v_user_id AND NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Permission denied. You can only delete your own tags.';
  END IF;

  -- Always wipe previous private messages & photos so the next owner starts clean
  DELETE FROM public.tag_messages WHERE tag_id = p_tag_id;
  DELETE FROM public.tag_scans WHERE tag_id = p_tag_id;

  -- If it's a pre-printed tag (has a batch_id) -> UNLINK & RESET
  IF v_tag.batch_id IS NOT NULL AND TRIM(v_tag.batch_id) <> '' THEN
    UPDATE public.tags
    SET 
      user_id = NULL,
      is_claimed = false,
      is_active = true,
      is_lost = false,
      title = 'Unclaimed Tag #' || UPPER(SUBSTRING(p_tag_id::TEXT FROM 1 FOR 8)),
      data = '{}'::jsonb,
      claimed_at = NULL,
      updated_at = NOW()
    WHERE id = p_tag_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'reset',
      'batch_id', v_tag.batch_id,
      'message', 'Physical tag has been unlinked and reset. It can now be scanned and activated again.'
    );
  ELSE
    -- If it's a purely digital tag with no batch_id -> HARD DELETE
    DELETE FROM public.tags WHERE id = p_tag_id;

    RETURN jsonb_build_object(
      'success', true,
      'action', 'deleted',
      'message', 'Tag permanently deleted.'
    );
  END IF;
END;
$$;

-- 6. Dedicated admin reset function for Customer Support
CREATE OR REPLACE FUNCTION public.admin_reset_tag(p_tag_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := false;
  v_tag RECORD;
BEGIN
  SELECT (role = 'admin') INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
  IF NOT COALESCE(v_is_admin, false) THEN
    RAISE EXCEPTION 'Only administrators can reset tags.';
  END IF;

  SELECT * INTO v_tag FROM public.tags WHERE id = p_tag_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tag not found.';
  END IF;

  DELETE FROM public.tag_messages WHERE tag_id = p_tag_id;
  DELETE FROM public.tag_scans WHERE tag_id = p_tag_id;

  UPDATE public.tags
  SET 
    user_id = NULL,
    is_claimed = false,
    is_active = true,
    is_lost = false,
    title = 'Unclaimed Tag #' || UPPER(SUBSTRING(p_tag_id::TEXT FROM 1 FOR 8)),
    data = '{}'::jsonb,
    claimed_at = NULL,
    updated_at = NOW()
  WHERE id = p_tag_id;

  RETURN jsonb_build_object(
    'success', true,
    'action', 'reset',
    'tag_id', p_tag_id
  );
END;
$$;
