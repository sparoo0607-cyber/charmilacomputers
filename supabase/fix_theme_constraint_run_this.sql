-- ================================================================
-- CRITICAL: Run this in Supabase Dashboard → SQL Editor
-- This fixes the theme activation issue permanently.
-- Without this, Dussara themes cannot be saved to the database.
-- ================================================================

-- Step 1: Drop the old restrictive constraint
ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_active_theme_check;

-- Step 2: Add new constraint that allows all valid themes
ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_active_theme_check
  CHECK (
    active_theme IN ('festive', 'standard')
    OR active_theme LIKE 'dussara-d%'
  );

-- Step 3: Verify it works by testing a dussara insert
-- (will rollback if it fails, so safe to run)
DO $$
BEGIN
  UPDATE public.store_settings
    SET active_theme = 'dussara-d1', updated_at = now()
    WHERE id = 'default';
  RAISE NOTICE 'SUCCESS: Dussara themes are now allowed in store_settings';
  -- Revert to standard for clean state
  UPDATE public.store_settings
    SET active_theme = 'standard', updated_at = now()
    WHERE id = 'default';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Step 4: Show current constraint status
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.store_settings'::regclass
  AND contype = 'c';
