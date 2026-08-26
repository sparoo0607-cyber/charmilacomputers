-- Charmila Computers — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query),
-- then run seed_products.sql to load the catalog.

-- ============================================================
-- PROFILES  (one row per auth.users row — customer or admin)
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

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: admins read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Users can edit their own name/phone, but CANNOT flip is_admin on themselves —
-- the WITH CHECK clause pins is_admin to whatever it already was.
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
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- PRODUCTS  (the catalog — admin panel writes, storefront reads)
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

create policy "products: public read" on public.products
  for select using (true);

create policy "products: admins write" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- BANNERS  (home hero carousel — admin panel writes, storefront reads)
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
  updated_at timestamptz not null default now()
);

alter table public.banners enable row level security;

create policy "banners: public read" on public.banners
  for select using (true);

create policy "banners: admins write" on public.banners
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- STORE_SETTINGS  (active_theme, store settings — admin writes, storefront reads)
-- ============================================================
create table if not exists public.store_settings (
  id text primary key default 'default',
  active_theme text not null default 'festive',
  store_name text not null default 'Charmila Computers',
  support_email text not null default 'info@charmilacomputers.in',
  support_phone text not null default '9010177427',
  gstin text not null default '37DDUPG5482C1Z7',
  free_shipping_threshold numeric not null default 3000,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "store_settings: public read" on public.store_settings
  for select using (true);

create policy "store_settings: admins write" on public.store_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

insert into public.store_settings (id, active_theme)
values ('default', 'festive')
on conflict (id) do nothing;

-- ============================================================
-- ORDERS + ORDER_ITEMS
-- Shape mirrors the app's existing Order/Address/OrderItem TS types 1:1,
-- so this is a drop-in swap for the old in-memory mock — no UI changes needed.
-- Guest checkout is allowed (user_id may be null); logged-in orders link to
-- auth.users so "My Orders" can query them. Note: since this app has no real
-- payment processing, guest inserts are intentionally permitted by RLS below —
-- same trust level as the rest of this demo storefront's checkout.
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

create policy "orders: read own, guest, or admin" on public.orders
  for select using (
    auth.uid() = user_id
    or user_id is null
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "orders: insert own or guest" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "orders: admins update" on public.orders
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

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

create policy "order_items: insert via own/guest order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or o.user_id is null)
    )
  );

-- ============================================================
-- Make an account an admin (run manually, once, per admin):
--   update public.profiles set is_admin = true where id =
--     (select id from auth.users where email = 'you@example.com');
-- ============================================================
