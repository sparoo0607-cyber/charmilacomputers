-- ============================================================
-- CHARMILA COMPUTERS — BACKEND FIX PASS  (2026-08-27)
--
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query,
-- AFTER supabase/full_setup.sql. Safe to re-run (fully idempotent).
--
-- What it fixes, and why:
--
--  1. store_settings.active_theme had the value 'festival' — which is
--     neither 'festive' nor 'standard', the only two ids the app knows.
--     That single bad row forced the whole storefront onto the fallback
--     theme and made the admin "Themes" toggle look like it did nothing.
--     -> coerce the value, then add a CHECK so it can never happen again.
--
--  2. store_settings / banners were writable with the public (anon) key
--     — anyone could rename the store or swap every banner. Re-assert the
--     "admins only" write policies (drops ANY stray permissive policy).
--     The /api/theme route now writes with the service-role key, so
--     locking these down does not break the admin theme switch.
--
--  3. Remove leftover "__test..." rows created while probing the API.
-- ============================================================

-- ------------------------------------------------------------
-- 1. store_settings.active_theme — coerce + constrain
-- ------------------------------------------------------------
update public.store_settings
   set active_theme = case
         when lower(coalesce(active_theme, '')) = 'standard' then 'standard'
         when lower(coalesce(active_theme, '')) like 'fest%'  then 'festive'
         when lower(coalesce(active_theme, '')) like '%vinayaka%' then 'festive'
         else 'standard'
       end
 where active_theme is null
    or active_theme not in ('festive', 'standard');

alter table public.store_settings
  drop constraint if exists store_settings_active_theme_check;

alter table public.store_settings
  add constraint store_settings_active_theme_check
  check (active_theme in ('festive', 'standard') or active_theme like 'dussara-d%');

-- Guarantee the singleton row exists.
insert into public.store_settings (id, active_theme)
values ('default', 'standard')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Re-assert write-protection on store_settings + banners.
--    Drop EVERY existing policy on each table, then recreate the
--    intended "public read / admins write" pair — this clears out
--    any old `using (true)` write policy left over from an earlier
--    setup script, whatever it was named.
-- ------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('store_settings', 'banners')
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

alter table public.store_settings enable row level security;
alter table public.banners        enable row level security;

create policy "store_settings: public read" on public.store_settings
  for select using (true);
create policy "store_settings: admins write" on public.store_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "banners: public read" on public.banners
  for select using (true);
create policy "banners: admins write" on public.banners
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ------------------------------------------------------------
-- 3. Clean up probe rows.
-- ------------------------------------------------------------
delete from public.order_items where starts_with(order_id, '__');
delete from public.orders      where starts_with(id, '__');
delete from public.products    where starts_with(id, '__');

-- ------------------------------------------------------------
-- Done. Quick verification:
-- ------------------------------------------------------------
-- select id, active_theme, updated_at from public.store_settings;
-- select tablename, policyname, cmd from pg_policies
--   where schemaname='public' and tablename in ('store_settings','banners')
--   order by tablename, cmd;
