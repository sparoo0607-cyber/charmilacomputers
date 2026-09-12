-- Run this once in the Supabase SQL editor.
--
-- store_settings.maintenance_mode already appears in the "create table if
-- not exists" blocks in charmila_master_setup.sql / full_setup.sql, but
-- since the store_settings table already exists in production, that
-- statement is a no-op and never actually adds the column. Without it,
-- toggling "Maintenance Mode" in /admin/settings only writes to that
-- admin's own browser localStorage — it never reaches Supabase, so no
-- other visitor (or device) ever sees the maintenance screen.
--
-- This migration adds the column for real and backfills the default row.

alter table public.store_settings
  add column if not exists maintenance_mode boolean not null default false;

update public.store_settings
  set maintenance_mode = false
  where id = 'default' and maintenance_mode is null;

-- Sanity check:
-- select id, active_theme, maintenance_mode, updated_at from public.store_settings;
