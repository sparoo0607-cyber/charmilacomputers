-- ==============================================================================
-- CHARMILA COMPUTERS — FULL SUPABASE SETUP (single source of truth)
-- ==============================================================================
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ==============================================================================

-- 1. PROFILES & ADMINS
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  is_admin boolean not null default false,
  charmila_coins int not null default 100,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: allow all" on public.profiles;
create policy "profiles: public read" on public.profiles for select using (true);
create policy "profiles: allow all" on public.profiles for all using (true) with check (true);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, email, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.email,
    case when lower(coalesce(new.email, '')) like '%admin%' or lower(coalesce(new.email, '')) = 'admin@charmilacomputers.in' then true else false end
  )
  on conflict (id) do update set
    email = excluded.email,
    is_admin = case when lower(coalesce(excluded.email, '')) like '%admin%' or lower(coalesce(excluded.email, '')) = 'admin@charmilacomputers.in' then true else public.profiles.is_admin end;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. PRODUCTS
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
  images text[],
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
drop policy if exists "products: public read" on public.products;
drop policy if exists "products: admins write" on public.products;
drop policy if exists "products: allow all writes" on public.products;
create policy "products: public read" on public.products for select using (true);
create policy "products: allow all writes" on public.products for all using (true) with check (true);

-- 3. STORE_SETTINGS (Themes & Store Config)
create table if not exists public.store_settings (
  id text primary key default 'default',
  active_theme text not null default 'standard',
  store_name text not null default 'Charmila Computers',
  support_email text not null default 'info@charmilacomputers.in',
  support_phone text not null default '9010177427',
  gstin text not null default '37DDUPG5482C1Z7',
  free_shipping_threshold numeric not null default 3000,
  maintenance_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.store_settings drop constraint if exists store_settings_active_theme_check;
alter table public.store_settings add constraint store_settings_active_theme_check
  check (active_theme in ('festive', 'standard') or active_theme like 'dussara-d%' or active_theme like 'dussara%');

alter table public.store_settings enable row level security;
drop policy if exists "store_settings: public read" on public.store_settings;
drop policy if exists "store_settings: allow all" on public.store_settings;
create policy "store_settings: public read" on public.store_settings for select using (true);
create policy "store_settings: allow all" on public.store_settings for all using (true) with check (true);

insert into public.store_settings (id, active_theme, store_name)
values ('default', 'standard', 'Charmila Computers')
on conflict (id) do nothing;

-- 4. BANNERS
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
drop policy if exists "banners: allow all" on public.banners;
create policy "banners: public read" on public.banners for select using (true);
create policy "banners: allow all" on public.banners for all using (true) with check (true);

-- 5. ORDERS & ITEMS
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'Processing',
  tracking_number text,
  courier text,
  subtotal numeric not null default 0,
  shipping_fee numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  payment_method text not null,
  payment_status text not null default 'Pending',
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
drop policy if exists "orders: allow all" on public.orders;
drop policy if exists "order_items: allow all" on public.order_items;
create policy "orders: allow all" on public.orders for all using (true) with check (true);
create policy "order_items: allow all" on public.order_items for all using (true) with check (true);

-- 6. PAGE_VIEWS
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  kind text not null default 'page',
  slug text,
  visitor_id text,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;
drop policy if exists "page_views: allow all" on public.page_views;
create policy "page_views: allow all" on public.page_views for all using (true) with check (true);

-- 7. STORAGE
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images: allow all" on storage.objects;
create policy "product-images: allow all" on storage.objects for all using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
