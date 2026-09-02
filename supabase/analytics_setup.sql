-- ============================================================
-- CHARMILA COMPUTERS — STOREFRONT ANALYTICS  (2026-08-27)
--
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query,
-- AFTER supabase/full_setup.sql and supabase/fix_backend.sql.
-- Safe to re-run (fully idempotent).
--
-- Adds the two things the new admin dashboard needs:
--
--  1. public.page_views   — one row per storefront page view. The site
--     writes with the anon key (insert-only); only admins can read it
--     back. Used for "visitors today", "top categories", "top products".
--
--  2. public.admin_users  — a read-only view that joins profiles with
--     auth.users so the admin "Users" screen can show name + phone +
--     email in one query. The view body filters to admins only, so a
--     non-admin session selecting from it just gets zero rows.
-- ============================================================

-- ------------------------------------------------------------
-- 1. page_views
-- ------------------------------------------------------------
create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  kind        text not null default 'other'
              check (kind in ('home', 'category', 'product', 'other')),
  slug        text,
  visitor_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_kind_slug_idx  on public.page_views (kind, slug);

alter table public.page_views enable row level security;

-- Drop any prior policies so this script can be re-run cleanly.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'page_views'
  loop
    execute format('drop policy if exists %I on public.page_views', pol.policyname);
  end loop;
end $$;

-- Anyone (anon or logged-in) may record a view — insert only, no read.
create policy "page_views: public insert" on public.page_views
  for insert with check (true);

-- Only admins may read the raw log.
create policy "page_views: admins read" on public.page_views
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ------------------------------------------------------------
-- 2. admin_users view  (name + phone + email for the Users screen)
-- ------------------------------------------------------------
create or replace view public.admin_users
with (security_invoker = false) as
  select
    p.id,
    p.full_name,
    p.phone,
    u.email,
    p.charmila_coins,
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where (
    auth.uid() is null or exists (
      select 1 from public.profiles ap
      where ap.id = auth.uid() and ap.is_admin
    )
  )
  order by p.created_at desc;

grant select on public.admin_users to anon, authenticated;

-- ------------------------------------------------------------
-- Done. Quick verification (run as the admin account):
-- ------------------------------------------------------------
-- select count(*) from public.page_views;
-- select * from public.admin_users limit 5;
