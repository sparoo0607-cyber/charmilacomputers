-- ============================================================
-- CHARMILA COMPUTERS — FULL SUPABASE SETUP (single source of truth)
--
-- Run this ONCE in Supabase Dashboard → SQL Editor → New query.
-- Safe to re-run any time (every statement is idempotent — drops
-- policies before recreating them, uses `if not exists` / `on conflict`).
--
-- This replaces schema.sql + charmila_complete_setup.sql + seed_products.sql,
-- which had drifted out of sync with each other and with the app's TS types.
-- Keep this ONE file going forward.
-- ============================================================

-- ============================================================
-- 1. PROFILES  (one row per auth.users row — customer or admin)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  charmila_coins int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: admins read all" on public.profiles;
create policy "profiles: admins read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Users can edit their own name/phone, but CANNOT flip is_admin on themselves.
drop policy if exists "profiles: update own (not is_admin)" on public.profiles;
create policy "profiles: update own (not is_admin)" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. PRODUCTS  (the catalog — admin panel writes, storefront reads)
-- ============================================================
create table if not exists public.products (
  id text primary key,
  category_slug text not null,
  name text not null,
  brand text not null,
  model text not null default 'N/A',
  price numeric not null default 0,
  mrp numeric,
  wattage int,
  in_stock boolean not null default true,
  stock_qty int not null default 0,
  rating numeric,
  reviews_count int,
  specs jsonb,
  features jsonb,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "products: public read" on public.products;
create policy "products: public read" on public.products
  for select using (true);

drop policy if exists "products: admins write" on public.products;
create policy "products: admins write" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 3. BANNERS  (home hero carousel — admin panel writes, storefront reads)
-- ============================================================
create table if not exists public.banners (
  id text primary key,
  image_src text not null,
  badge_text text,
  title_line1 text,
  title_line2 text,
  subtitle text,
  button_text text,
  button_link text,
  button2_text text,
  button2_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;

drop policy if exists "banners: public read" on public.banners;
create policy "banners: public read" on public.banners
  for select using (true);

drop policy if exists "banners: admins write" on public.banners;
create policy "banners: admins write" on public.banners
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 4. STORE_SETTINGS  (active theme + store info — admin writes, storefront reads)
-- ============================================================
create table if not exists public.store_settings (
  id text primary key default 'default',
  active_theme text not null default 'standard'
    check (active_theme in ('festive', 'standard')),
  store_name text not null default 'Charmila Computers',
  support_email text not null default 'info@charmilacomputers.in',
  support_phone text not null default '9010177427',
  gstin text not null default '37DDUPG5482C1Z7',
  free_shipping_threshold numeric not null default 3000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

drop policy if exists "store_settings: public read" on public.store_settings;
create policy "store_settings: public read" on public.store_settings
  for select using (true);

drop policy if exists "store_settings: admins write" on public.store_settings;
create policy "store_settings: admins write" on public.store_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

insert into public.store_settings (id, active_theme)
values ('default', 'standard')
on conflict (id) do nothing;

-- ============================================================
-- 5. ORDERS + ORDER_ITEMS
-- Shape mirrors the app's Order/Address/OrderItem TS types 1:1.
-- No in-app checkout exists anymore (WhatsApp-only ordering) — these tables
-- exist so staff can log orders taken over WhatsApp/phone from the admin
-- panel, and so "My Orders" can show a customer their order history.
-- ============================================================
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'Processing'
    check (status in ('Processing','Packed','Shipped','Out for Delivery','Delivered','Cancelled')),
  tracking_number text,
  courier text,
  subtotal numeric not null default 0,
  shipping_fee numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null,
  payment_status text not null default 'Pending'
    check (payment_status in ('Paid','Pending','Cash on Delivery')),
  ship_full_name text not null,
  ship_phone text not null,
  ship_email text not null,
  ship_street text not null,
  ship_landmark text,
  ship_city text not null,
  ship_state text not null,
  ship_pincode text not null,
  gst_number text,
  company_name text,
  estimated_delivery text
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id text not null references public.orders(id) on delete cascade,
  product_id text,
  name text not null,
  price numeric not null,
  qty int not null default 1,
  brand text,
  category_slug text
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "orders: read own, guest, or admin" on public.orders;
create policy "orders: read own, guest, or admin" on public.orders
  for select using (
    auth.uid() = user_id
    or user_id is null
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "orders: insert own or guest" on public.orders;
create policy "orders: insert own or guest" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists "orders: admins update" on public.orders;
create policy "orders: admins update" on public.orders
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "order_items: read via parent order" on public.order_items;
create policy "order_items: read via parent order" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.uid()
          or o.user_id is null
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
        )
    )
  );

drop policy if exists "order_items: insert via own/guest order" on public.order_items;
create policy "order_items: insert via own/guest order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- Only admins can manage orders directly from the dashboard (staff logging a
-- WhatsApp order manually) — admins bypass the "own order" insert check above.
drop policy if exists "orders: admins insert" on public.orders;
create policy "orders: admins insert" on public.orders
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "order_items: admins insert" on public.order_items;
create policy "order_items: admins insert" on public.order_items
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 6. STORAGE — public bucket for product photos & banner images
-- Replaces the old base64-data-URL approach (huge text blobs in the DB).
-- Admin uploads write here; the storefront reads the public URL.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product-images: admins write" on storage.objects;
create policy "product-images: admins write" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "product-images: admins update" on storage.objects;
create policy "product-images: admins update" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

drop policy if exists "product-images: admins delete" on storage.objects;
create policy "product-images: admins delete" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 7. SEED BANNERS (safe to re-run — updates existing rows)
-- ============================================================
insert into public.banners (id, image_src, badge_text, title_line1, title_line2, subtitle, button_text, button_link, button2_text, button2_link)
values
('main', '/images/festive/hero-main.png', 'VINAYAKA CHAVITHI SALE · UP TO 40% OFF', 'ELEVATE YOUR', 'SETUP TODAY', 'Next-gen processors, RTX 50 GPUs & custom liquid-cooled rigs at unbeatable festive prices.', 'Explore Offers', '/offers', 'Build Your PC', '/build-your-pc'),
('gaming', '/images/festive/hero-gaming-fest.png', 'GAMING FEST · UP TO 45% OFF', 'PRO GAMING', 'GEAR', 'Keyboards, mice & RGB headsets', 'Shop Gear', '/category/gaming', null, null),
('builder', '/images/festive/hero-save-more.png', 'PC BUILDER DEALS', 'SAVE MORE', 'BUILD MORE', 'Motherboards, RAM & Fast SSDs', 'Start Building', '/build-your-pc', null, null)
on conflict (id) do update set
  image_src = excluded.image_src,
  badge_text = excluded.badge_text,
  title_line1 = excluded.title_line1,
  title_line2 = excluded.title_line2,
  subtitle = excluded.subtitle,
  button_text = excluded.button_text,
  button_link = excluded.button_link,
  button2_text = excluded.button2_text,
  button2_link = excluded.button2_link,
  updated_at = now();

-- ============================================================
-- 8. SEED PRODUCTS — run supabase/seed_products.sql after this file
--    (kept separate: it's 76 rows and easiest to maintain on its own).
--    It uses `on conflict (id) do nothing`; if you've since edited a
--    product in the admin panel, re-running it will NOT overwrite your edit.
-- ============================================================

-- ============================================================
-- 9. Make an account an admin (run manually, once, per admin):
--   update public.profiles set is_admin = true where id =
--     (select id from auth.users where email = 'you@example.com');
-- ============================================================
