-- ============================================================
-- CHARMILA COMPUTERS — DUSSARA THEMES CONSTRAINT UPDATE
--
-- Run this query in Supabase Dashboard → SQL Editor to update the
-- check constraint on `store_settings.active_theme` so all 11 themes
-- ('standard', 'festive', 'dussara-d1' .. 'dussara-d9') can be activated.
-- ============================================================

alter table public.store_settings
  drop constraint if exists store_settings_active_theme_check;

alter table public.store_settings
  add constraint store_settings_active_theme_check
  check (active_theme in ('festive', 'standard') or active_theme like 'dussara-d%');
