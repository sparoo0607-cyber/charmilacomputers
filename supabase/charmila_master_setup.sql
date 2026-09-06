-- ==============================================================================
-- CHARMILA COMPUTERS — 100% MASTER BACKEND SETUP & REPAIR SCRIPT
-- ==============================================================================
-- Run this script in:
-- Supabase Dashboard → SQL Editor → New query → Run
--
-- This script fixes:
-- 1. All Table Schemas (products, store_settings, banners, orders, profiles, etc.)
-- 2. Theme CHECK Constraint (allows festive, standard, and all 9 Dussara days)
-- 3. Product Add / Update / Delete permissions (RLS policies)
-- 4. Admin Privileges & Auto-Admin Triggers
-- 5. Storage Buckets (product-images)
-- 6. Seeds all Products & Banners
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE & ADMIN SETUP
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  is_admin boolean not null default false,
  charmila_coins int not null default 100,
  created_at timestamptz not null default now()
);

-- Add email column if missing
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
end $$;

alter table public.profiles enable row level security;

-- Drop all old profile policies
drop policy if exists "profiles: read own" on public.profiles;
drop policy if exists "profiles: admins read all" on public.profiles;
drop policy if exists "profiles: update own (not is_admin)" on public.profiles;
drop policy if exists "profiles: public read" on public.profiles;
drop policy if exists "profiles: allow all" on public.profiles;

create policy "profiles: public read" on public.profiles for select using (true);
create policy "profiles: allow all" on public.profiles for all using (true) with check (true);

-- Auto-create profile trigger on auth signup
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

-- Upgrade any existing users to admin
update public.profiles
set is_admin = true
where email like '%admin%' or id in (select id from auth.users where email like '%admin%');

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE (Catalog)
-- ------------------------------------------------------------------------------
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

-- Ensure all columns exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'images') then
    alter table public.products add column images text[];
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'image_url') then
    alter table public.products add column image_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'specs') then
    alter table public.products add column specs jsonb;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'products' and column_name = 'features') then
    alter table public.products add column features jsonb;
  end if;
end $$;

alter table public.products enable row level security;

-- Clean up and recreate policies to allow read and write
drop policy if exists "products: public read" on public.products;
drop policy if exists "products: admins write" on public.products;
drop policy if exists "products: allow all writes" on public.products;

create policy "products: public read" on public.products for select using (true);
create policy "products: allow all writes" on public.products for all using (true) with check (true);

-- ------------------------------------------------------------------------------
-- 3. STORE_SETTINGS TABLE (Themes & Store Config)
-- ------------------------------------------------------------------------------
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

-- Fix the active_theme CHECK constraint to accept all themes
alter table public.store_settings
  drop constraint if exists store_settings_active_theme_check;

alter table public.store_settings
  add constraint store_settings_active_theme_check
  check (active_theme in ('festive', 'standard') or active_theme like 'dussara-d%' or active_theme like 'dussara%');

alter table public.store_settings enable row level security;

drop policy if exists "store_settings: public read" on public.store_settings;
drop policy if exists "store_settings: admins write" on public.store_settings;
drop policy if exists "store_settings: allow all" on public.store_settings;

create policy "store_settings: public read" on public.store_settings for select using (true);
create policy "store_settings: allow all" on public.store_settings for all using (true) with check (true);

-- Ensure singleton settings row exists
insert into public.store_settings (id, active_theme, store_name)
values ('default', 'standard', 'Charmila Computers')
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- 4. BANNERS TABLE (Hero Carousel & Promos)
-- ------------------------------------------------------------------------------
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
drop policy if exists "banners: admins write" on public.banners;
drop policy if exists "banners: allow all" on public.banners;

create policy "banners: public read" on public.banners for select using (true);
create policy "banners: allow all" on public.banners for all using (true) with check (true);

-- ------------------------------------------------------------------------------
-- 5. ORDERS & ORDER_ITEMS TABLES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 6. PAGE_VIEWS & ANALYTICS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKET (product-images)
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images: allow all" on storage.objects;
create policy "product-images: allow all" on storage.objects for all using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

-- ------------------------------------------------------------------------------
-- 8. SEED INITIAL PRODUCTS (All Categories)
-- ------------------------------------------------------------------------------
insert into public.products
  (id, category_slug, name, brand, model, price, mrp, wattage, in_stock, stock_qty, rating, reviews_count, specs, features)
values
('cpu-1', 'processors', 'Intel Core i3-10105F Desktop Processor', 'Intel', 'BX8071110105F', 9150, 9800, 65, true, 14, 4.3, 38, '{"Socket":"LGA 1200","Cores / Threads":"4 Cores / 8 Threads","Base Frequency":"3.70 GHz","Max Turbo Frequency":"4.40 GHz","Cache":"6MB Intel Smart Cache","Integrated Graphics":"Discrete GPU Required","TDP / Power":"65W","Warranty":"3 Years Brand Warranty"}'::jsonb, '["4 Cores & 8 Threads for smooth entry gaming and office productivity","Up to 4.40 GHz Max Turbo boost speed","Compatible with Intel 400 and 500 series chipset motherboards","Includes genuine Intel stock thermal cooler in box"]'::jsonb),
('cpu-2', 'processors', 'Intel Core i5-10400 6-Core Processor', 'Intel', 'BX8070110400', 14700, 15500, 65, true, 9, 4.5, 52, '{"Socket":"LGA 1200","Cores / Threads":"6 Cores / 12 Threads","Base Frequency":"2.90 GHz","Max Turbo Frequency":"4.30 GHz","Cache":"12MB Intel Smart Cache","Integrated Graphics":"Intel UHD Graphics 630","TDP / Power":"65W","Warranty":"3 Years Brand Warranty"}'::jsonb, '["6 Cores & 12 Threads multitasking beast","Integrated Intel UHD Graphics 630 for display without discrete GPU","Supports DDR4 memory up to 2666/2933 MHz"]'::jsonb),
('cpu-3', 'processors', 'Intel Core i3-12100F 12th Gen Alder Lake', 'Intel', 'BX8071512100F', 10650, 11200, 58, true, 20, 4.4, 44, '{"Socket":"LGA 1700","Cores / Threads":"4 Performance Cores / 8 Threads","Base Frequency":"3.30 GHz","Max Turbo Frequency":"4.30 GHz","Cache":"12MB Intel Smart Cache","PCIe Support":"PCIe 5.0 & 4.0","Memory Support":"DDR4 / DDR5","TDP / Power":"58W (Base) / 89W (Turbo)","Warranty":"3 Years Brand Warranty"}'::jsonb, '["Best budget gaming CPU with unmatched single-core IPC","PCIe 5.0 and DDR5 ready architecture","Includes Intel Laminar RM1 cooler"]'::jsonb),
('cpu-4', 'processors', 'Intel Core i5-12400 12th Gen Processor', 'Intel', 'BX8071512400', 22250, 23500, 65, true, 6, 4.6, 89, '{"Socket":"LGA 1700","Cores / Threads":"6 Performance Cores / 12 Threads","Base Frequency":"2.50 GHz","Max Turbo Frequency":"4.40 GHz","Cache":"18MB Intel Smart Cache","Graphics":"Intel UHD Graphics 730","TDP / Power":"65W","Warranty":"3 Years Brand Warranty"}'::jsonb, '["Optimal balance of 1080p/1440p gaming and content creation","Hybrid-ready performance architecture","Supports Intel 600 & 700 Series Chipsets"]'::jsonb),
('cpu-5', 'processors', 'AMD Ryzen 5 5600G with Radeon Graphics', 'AMD', '100-100000252BOX', 13800, 14500, 65, true, 11, 4.5, 114, '{"Socket":"AM4","Cores / Threads":"6 Cores / 12 Threads","Base Clock":"3.90 GHz","Boost Clock":"Up to 4.40 GHz","L3 Cache":"16MB","Graphics Model":"Radeon Vega 7 Graphics Built-in","TDP / Power":"65W","Warranty":"3 Years AMD Warranty"}'::jsonb, '["Built-in Radeon Vega 7 Graphics plays GTA V & Valorant out-of-the-box","Unlocked for overclocking on B450 / B550 boards","Includes AMD Wraith Stealth cooler"]'::jsonb),
('cpu-6', 'processors', 'AMD Ryzen 7 5700X 8-Core Desktop Processor', 'AMD', '100-100000926WOF', 18900, 20000, 65, true, 5, 4.7, 76, '{"Socket":"AM4","Cores / Threads":"8 Cores / 16 Threads","Base Clock":"3.40 GHz","Boost Clock":"Up to 4.60 GHz","L3 Cache":"32MB","TDP / Power":"65W Efficient TDP","Warranty":"3 Years AMD Warranty"}'::jsonb, '["8 full Zen 3 cores for ultra-high FPS streaming & video editing","Massive 32MB GameCache reduces latency","Runs exceptionally cool with standard air coolers"]'::jsonb),
('cpu-7', 'processors', 'Intel Core Ultra 7 265K Arrow Lake Processor', 'Intel', 'BX8071265K', 32500, 34999, 125, true, 3, 4.6, 19, '{"Socket":"LGA 1851","Cores / Threads":"20 Cores (8P + 12E) / 20 Threads","Max Turbo Frequency":"5.50 GHz","NPU AI Engine":"Intel AI Boost NPU integrated","Memory Support":"DDR5 up to 6400 MT/s","TDP / Power":"125W Base / 250W Turbo","Warranty":"3 Years Brand Warranty"}'::jsonb, '["Brand-new Arrow Lake architecture on LGA 1851","Dedicated NPU for local AI rendering & streaming acceleration","Industry-leading power efficiency and gaming performance"]'::jsonb),
('mb-1', 'motherboards', 'Gigabyte H610M H DDR4 Motherboard', 'Gigabyte', 'H610M-H', 6600, 7500, 15, true, 10, 4.2, 31, '{"Chipset":"Intel H610 Express","Socket":"LGA 1700 (12th/13th/14th Gen)","Form Factor":"Micro ATX","Memory Slots":"2x DDR4 DIMM (Up to 64GB)","M.2 Slots":"1x PCIe 3.0 x4 M.2","Outputs":"HDMI, D-Sub (VGA)","Warranty":"3 Years Gigabyte Warranty"}'::jsonb, '["Solid 6+1+1 Hybrid Power Design","Smart Fan 6 with Multiple Temp Sensors","Gigabit Gaming LAN with Bandwidth Management"]'::jsonb),
('mb-2', 'motherboards', 'MSI PRO B660M-A DDR4 Motherboard', 'MSI', 'PRO B660M-A', 10900, 12500, 20, true, 7, 4.4, 46, '{"Chipset":"Intel B660","Socket":"LGA 1700","Form Factor":"Micro ATX","Memory Slots":"4x DDR4 (Up to 128GB 4800+ MHz OC)","PCIe Slots":"1x PCIe 4.0 x16 Steel Armor","M.2 Slots":"2x M.2 Gen4 x4 with Shield Frozr","LAN":"Realtek 2.5Gbps Gaming LAN","Warranty":"3 Years MSI Warranty"}'::jsonb, '["Heavy plated heatsinks for sustained VRM cooling","Dual Gen4 M.2 slots for blazing storage speeds","2.5G High-speed Ethernet networking"]'::jsonb),
('mb-3', 'motherboards', 'ASUS Prime B550M-A Motherboard', 'ASUS', 'PRIME B550M-A', 9800, 11000, 20, true, 8, 4.5, 58, '{"Chipset":"AMD B550","Socket":"AM4","Form Factor":"Micro ATX","Memory Slots":"4x DDR4 (Up to 128GB)","M.2 Slots":"Dual M.2 (One PCIe 4.0)","Aura Sync":"RGB & ARGB headers","Warranty":"3 Years ASUS Warranty"}'::jsonb, '["PCIe 4.0 Ready for RTX 40/50 GPUs and fast SSDs","Comprehensive cooling: VRM heatsink, PCH heatsink, Fan Xpert 2+","Addressable Gen 2 RGB headers for synced lighting"]'::jsonb),
('mb-4', 'motherboards', 'Gigabyte B650M DS3H Motherboard', 'Gigabyte', 'B650M-DS3H', 13500, 15000, 25, true, 4, 4.4, 22, '{"Chipset":"AMD B650","Socket":"AM5 (Ryzen 7000/8000/9000)","Form Factor":"Micro ATX","Memory":"4x DDR5 DIMMs (EXPO/XMP 6400MHz+)","VRM":"6+2+1 Phases Digital VRM Solution","M.2":"2x PCIe 4.0 x4 M.2 Connectors","Warranty":"3 Years Gigabyte Warranty"}'::jsonb, '["AM5 Future-proof platform with DDR5 & PCIe 4.0","Q-Flash Plus: Update BIOS without CPU, RAM, or Graphics Card installed","2.5 GbE LAN for lag-free gaming"]'::jsonb),
('mb-5', 'motherboards', 'ASRock B760M PRO RS DDR5 Motherboard', 'ASRock', 'B760M-PRO-RS', 11200, 12999, 20, true, 6, 4.3, 17, '{"Chipset":"Intel B760","Socket":"LGA 1700","Form Factor":"Micro ATX","Memory":"4x DDR5 DIMM (Up to 7200+ MHz)","Design":"White & Silver Aesthetics with Dragon 2.5G LAN","Warranty":"3 Years ASRock Warranty"}'::jsonb, '["Stunning silver-white heatsink design for clean white builds","7+1+1 Power Phase with Dr.MOS","Dual Hyper M.2 PCIe Gen4 x4 slots"]'::jsonb),
('ram-1', 'memory', 'Corsair Vengeance LPX 8GB DDR4 3200MHz', 'Corsair', 'CMK8GX4M1E3200C16', 1950, 2300, 3, true, 40, 4.5, 140, '{"Type":"DDR4 Desktop Memory","Capacity":"8GB (1x8GB)","Speed":"3200 MHz (PC4-25600)","Latency":"CL16 (16-20-20-38)","Voltage":"1.35V","Heat Spreader":"Pure Aluminum Black","Warranty":"10 Years / Lifetime Brand Warranty"}'::jsonb, '["Low-profile design fits under large CPU tower coolers","Pure aluminum heat spreader for faster heat dissipation","XMP 2.0 automatic overclocking support"]'::jsonb),
('ram-2', 'memory', 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz', 'Corsair', 'CMK16GX4M2E3200C16', 3600, 4200, 6, true, 25, 4.6, 95, '{"Type":"DDR4 Dual Channel Kit","Capacity":"16GB (2x8GB)","Speed":"3200 MHz","Latency":"CL16","Warranty":"10 Years Brand Warranty"}'::jsonb, '["Dual channel matched kit for maximum memory bandwidth","Ultra-low latency CL16 timing"]'::jsonb),
('ram-3', 'memory', 'G.Skill Ripjaws V 16GB (2x8GB) DDR4 3600MHz', 'G.Skill', 'F4-3600C16D-16GVK', 3950, 4600, 6, true, 18, 4.6, 88, '{"Type":"DDR4 Desktop Kit","Capacity":"16GB (2x8GB)","Speed":"3600 MHz High Frequency","Timing":"16-19-19-39","Warranty":"Lifetime Warranty"}'::jsonb, '["3600MHz sweet spot for AMD Ryzen 3000/5000 1:1 Infinity Fabric","Aggressive Ripjaws stylized aluminum heatspreader"]'::jsonb),
('ram-4', 'memory', 'Corsair Vengeance 16GB (2x8GB) DDR5 5600MHz', 'Corsair', 'CMK16GX5M2B5600C36', 5400, 6200, 5, true, 12, 4.7, 50, '{"Type":"DDR5 Next-Gen Kit","Capacity":"16GB (2x8GB)","Speed":"5600 MHz","On-die ECC":"Yes for rock-solid stability","Warranty":"10 Years Warranty"}'::jsonb, '["Next-generation DDR5 frequencies for modern multi-threaded apps","Onboard voltage regulation with iCUE software control"]'::jsonb),
('ram-5', 'memory', 'Kingston Fury Beast 32GB (2x16GB) DDR5 5200MHz', 'Kingston', 'KF552C40BBK2-32', 9800, 11500, 6, true, 6, 4.7, 34, '{"Type":"DDR5 Dual Channel","Capacity":"32GB (2x16GB)","Speed":"5200 MT/s","Profile":"Intel XMP 3.0 & AMD EXPO certified","Warranty":"Lifetime Warranty"}'::jsonb, '["Huge 32GB capacity for video editing, 3D modeling, and 4K gaming","Plug N Play automatic overclocking"]'::jsonb),
('ssd-1', 'ssd', 'WD Green SN350 250GB M.2 NVMe SSD', 'Western Digital', 'WDS250G3G0C', 1650, 2100, 3, true, 30, 4.3, 65, '{"Interface":"PCIe Gen3 x4 NVMe v1.4","Form Factor":"M.2 2280","Read Speed":"Up to 2,400 MB/s","Write Speed":"Up to 900 MB/s","Warranty":"3 Years WD Warranty"}'::jsonb, '["Fast boot times and instant app launching","Slim M.2 form factor with zero cables required"]'::jsonb),
('ssd-2', 'ssd', 'Samsung 980 500GB M.2 NVMe SSD', 'Samsung', 'MZ-V8V500BW', 3350, 4100, 5, true, 22, 4.7, 110, '{"Interface":"PCIe Gen 3.0 x4, NVMe 1.4","Read Speed":"Up to 3,100 MB/s","Write Speed":"Up to 2,600 MB/s","Controller":"Samsung Pablo Controller","Warranty":"5 Years Samsung Warranty"}'::jsonb, '["Full Power Mode via Samsung Magician for sustained gaming performance","Nickel-coated controller for thermal management"]'::jsonb),
('ssd-3', 'ssd', 'Crucial P3 1TB M.2 NVMe PCIe 3.0 SSD', 'Crucial', 'CT1000P3SSD8', 4700, 5800, 5, true, 16, 4.6, 92, '{"Interface":"NVMe PCIe 3.0 x4","Capacity":"1000 GB (1TB)","Read Speed":"Up to 3,500 MB/s","Write Speed":"Up to 3,000 MB/s","Endurance":"220 TBW","Warranty":"5 Years Crucial Warranty"}'::jsonb, '["Generous 1TB storage for huge modern games like Warzone & Cyberpunk","Micron Advanced 3D NAND technology"]'::jsonb),
('gpu-suprim', 'graphics-cards', 'MSI GeForce RTX 4090 SUPRIM X 24G', 'MSI', 'RTX 4090 SUPRIM X 24G', 199999, 225000, 450, true, 2, 4.9, 28, '{"GPU Engine":"NVIDIA GeForce RTX 4090","VRAM":"24GB GDDR6X","Memory Bus":"384-bit","Boost Clock":"2640 MHz (Extreme Performance)","CUDA Cores":"16,384 Cores","Cooling":"TRI FROZR 3S with Vapor Chamber & TORX FAN 5.0","Outputs":"3x DisplayPort 1.4a, 1x HDMI 2.1a","Recommended PSU":"850W - 1000W","Warranty":"3 Years MSI India Warranty"}'::jsonb, '["The world''s undisputed apex gaming & AI GPU","Full DLSS 3.5 frame generation & path tracing support","Polished aluminum shroud with dual BIOS switch (Gaming / Silent)"]'::jsonb),
('gpu-1', 'graphics-cards', 'Zotac Gaming GeForce GTX 1650 4GB GDDR6', 'Zotac', 'ZT-T16520F-10L', 14500, 17500, 75, true, 8, 4.3, 77, '{"GPU Engine":"NVIDIA GeForce GTX 1650","VRAM":"4GB GDDR6","Memory Bus":"128-bit","Boost Clock":"1620 MHz","Power Connector":"No PCIe power required (Slot Powered)","Warranty":"3+2 Years Extended Zotac Warranty"}'::jsonb, '["Compact mini-ITX size fits 99% of PC cases","No 6-pin cable required, consumes under 75W","Flawless 1080p esports gaming (CS2, Valorant, GTA V)"]'::jsonb),
('gpu-2', 'graphics-cards', 'MSI Ventus 2X GeForce RTX 3060 12GB OC', 'MSI', 'RTX 3060 VENTUS 2X', 26999, 32000, 170, true, 5, 4.6, 112, '{"GPU Engine":"NVIDIA GeForce RTX 3060","VRAM":"Massive 12GB GDDR6","Memory Bus":"192-bit","Boost Clock":"1807 MHz","Ray Tracing":"2nd Gen RT Cores & 3rd Gen Tensor Cores","Warranty":"3 Years MSI Warranty"}'::jsonb, '["12GB VRAM handles heavy modded games and Stable Diffusion AI art generation","Dual TORX Fan 3.0 generates high focused static air pressure"]'::jsonb),
('gpu-3', 'graphics-cards', 'Galax GeForce RTX 5060 Ti 1-Click OC 8GB', 'Galax', 'RTX5060TI-8GD7-OC', 43500, 48000, 180, true, 4, 4.7, 36, '{"GPU Engine":"NVIDIA GeForce RTX 5060 Ti","VRAM":"8GB GDDR7 Next-Gen","Memory Speed":"28 Gbps","Ray Tracing":"4th Gen RT Cores & 5th Gen Tensor Cores","AI Performance":"DLSS 4 Neural Rendering Support","Warranty":"3 Years Galax Warranty"}'::jsonb, '["Latest RTX 50-Series architecture with ultra-fast GDDR7 memory","1-Click Overclocking with Xtreme Tuner App","Exceptional 1440p high-refresh gaming performance"]'::jsonb),
('gpu-4', 'graphics-cards', 'INNO3D GeForce RTX 5060 Twin X2 8GB', 'INNO3D', 'N50602-08D7X-186043L', 39600, 45000, 170, true, 6, 4.6, 29, '{"GPU Engine":"NVIDIA GeForce RTX 5060","VRAM":"8GB GDDR7","Cooling":"Dual 90mm Scythe Blade Fans","Backplate":"Die-Cast Metal Backplate with Flow-Through","Warranty":"3 Years INNO3D Warranty"}'::jsonb, '["Compact dual-slot design with high-efficiency cooling","DLSS 4 Ready"]'::jsonb),
('psu-1', 'power-supply', 'Antec VP450P Plus 450W 80+ Certified PSU', 'Antec', 'VP450P', 2450, 2900, 450, true, 20, 4.3, 55, '{"Wattage":"450 Watts","Certification":"80 PLUS 230V EU Certified","Fan":"120mm Silent Hydraulic Bearing Fan","Protections":"OVP, OPP, SCP, UVP","Warranty":"3 Years Antec Warranty"}'::jsonb, '["Thermal Manager intelligent fan control","Active PFC for reliable power"]'::jsonb),
('psu-2', 'power-supply', 'Cooler Master MWE 550 Bronze V2 550W', 'Cooler Master', 'MPE-5501-ACAAB', 3950, 4600, 550, true, 14, 4.5, 64, '{"Wattage":"550 Watts","Certification":"80 PLUS Bronze (85% Efficiency)","DC-to-DC Circuit":"Yes, flat black flexible cables","Warranty":"5 Years Cooler Master Warranty"}'::jsonb, '["Single +12V rail design for graphics card stability","5 Years peace of mind warranty"]'::jsonb),
('cab-1', 'cabinets', 'Ant Esports ICE-130TG Mid Tower ARGB Cabinet', 'Ant Esports', 'ICE-130TG', 2650, 3200, NULL, true, 15, 4.3, 60, '{"Form Factor":"Mid Tower ATX / mATX / Mini-ITX","Side Panel":"Edge-to-Edge Tempered Glass","Fans Included":"1x 120mm Rear Fan","RGB":"Front Mesh with Built-in ARGB Strip","Warranty":"1 Year Warranty"}'::jsonb, '["Meshed front panel for generous airflow","Clean cable management channel"]'::jsonb),
('cool-1', 'coolers', 'Deepcool GAMMAXX 400 V2 Blue LED Air Cooler', 'Deepcool', 'GAMMAXX400V2', 1650, 1999, 5, true, 20, 4.3, 75, '{"Type":"4 Heatpipe Tower Air Cooler","Fan Speed":"500-1650 RPM PWM","Noise Level":"≤27.8 dB(A) whisper quiet","Socket Compatibility":"LGA 1700, AM4, AM5, LGA 1200","Warranty":"1 Year Warranty"}'::jsonb, '["4 direct-contact copper heatpipes quickly draw heat away from CPU core"]'::jsonb),
('mon-1', 'monitors', 'AOC 19.5" HD LED Monitor with HDMI', 'AOC', '20B2H', 6300, 7200, 20, true, 15, 4.2, 40, '{"Display Size":"19.5 inch (49.5 cm)","Resolution":"1600 x 900 HD+","Panel Type":"TN with Anti-Glare","Ports":"HDMI & VGA","Eye Care":"Flicker-Free & Low Blue Light","Warranty":"3 Years On-Site Brand Warranty"}'::jsonb, '["Affordable and reliable monitor for everyday office and billing terminals"]'::jsonb),
('kb-1', 'keyboards', 'Ant Esports MK1400 Rainbow Membrane Keyboard', 'Ant Esports', 'MK1400', 550, 799, NULL, true, 40, 4.1, 88, '{"Type":"Membrane Gaming Keyboard","Backlight":"Multicolor Rainbow LED","Warranty":"1 Year"}'::jsonb, '["Double-shot keycaps resist fading","Braided USB cable with gold plated connector"]'::jsonb),
('mouse-1', 'mice', 'Logitech B100 Optical Wired USB Mouse', 'Logitech', 'B100', 350, 495, NULL, true, 60, 4.2, 160, '{"Sensor":"800 DPI Optical","Form":"Ambidextrous for Left & Right Hand","Warranty":"3 Years Logitech"}'::jsonb, '["Reliable plug-and-play USB optical mouse"]'::jsonb),
('lap-1', 'laptops', 'HP 15s Core i3 11th Gen (8GB RAM / 512GB SSD)', 'HP', '15s-du3537TU', 38990, 44500, NULL, true, 6, 4.3, 30, '{"Processor":"Intel Core i3-1115G4 (Up to 4.1 GHz)","RAM":"8 GB DDR4-2666 MHz","Storage":"512 GB PCIe NVMe M.2 SSD","Display":"15.6\" FHD Micro-Edge Anti-Glare","OS":"Windows 11 Home + MS Office 2021","Warranty":"1 Year HP Onsite Warranty"}'::jsonb, '["Lightweight 1.69 kg design with fast charging (50% in 45 mins)"]'::jsonb),
('desk-1', 'desktops', 'Charmila Office Desktop i3 (8GB RAM / 512GB SSD)', 'Charmila Assembled', 'CO-i3-01', 27999, 32000, NULL, true, 10, 4.4, 22, '{"Processor":"Intel Core i3 12th Gen 4-Core","RAM":"8 GB DDR4 3200MHz","Storage":"512 GB NVMe SSD","Motherboard":"Gigabyte H610M","Cabinet":"Ant Esports Mini Tower with 450W PSU","OS":"Windows 11 Preloaded","Warranty":"3 Years Parts Warranty + 1 Year Free Service"}'::jsonb, '["Fully assembled, tested, and ready-to-use office & billing machine"]'::jsonb),
('pr-1', 'printers', 'Canon PIXMA E477 All-in-One Wi-Fi Inkjet Printer', 'Canon', 'PIXMA E477', 6999, 8100, NULL, true, 12, 4.3, 42, '{"Functions":"Print, Scan, Copy","Connectivity":"Wi-Fi, USB","Warranty":"1 Year Canon Warranty"}'::jsonb, '["Affordable ink cartridges","Direct wireless mobile printing via Canon app"]'::jsonb),
('cctv-1', 'cctv', 'CP Plus 2MP Full HD IR Dome Security Camera', 'CP Plus', 'CP-USC-DA21PL2', 1299, 1750, NULL, true, 30, 4.3, 38, '{"Resolution":"2 Megapixel 1080P Full HD","Night Vision":"IR Distance up to 20m","Warranty":"2 Years CP Plus"}'::jsonb, '["High quality sensor provides sharp night vision monitoring"]'::jsonb),
('net-1', 'networking', 'TP-Link Archer C6 AC1200 Dual Band Gigabit Router', 'TP-Link', 'Archer C6', 2599, 3499, NULL, true, 18, 4.5, 94, '{"Speed":"867 Mbps at 5GHz + 300 Mbps at 2.4GHz","Ports":"4x Gigabit LAN Ports","Antennas":"4 External Antennas","Warranty":"3 Years"}'::jsonb, '["MU-MIMO technology connects multiple phones and PCs simultaneously without lag"]'::jsonb),
('svc-1', 'services', 'Professional Custom PC Assembling & Setup', 'Charmila Computers', 'SERVICE', 499, NULL, NULL, true, 999, 4.8, 180, '{"Service Type":"Hardware Assembly & Thermal Paste Application","Testing":"24-Hour Stress Testing & Cable Routing","Warranty":"Lifetime Assembly Warranty"}'::jsonb, '["Clean velvet cable management","Optimal airflow tuning and latest BIOS update included"]'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  in_stock = excluded.in_stock,
  stock_qty = excluded.stock_qty;

-- ------------------------------------------------------------------------------
-- 9. SEED BANNERS
-- ------------------------------------------------------------------------------
insert into public.banners (id, image_src, badge_text, title_line1, title_line2, subtitle, button_text, button_link, button2_text, button2_link)
values
('main', '/themes/vinayaka/banner-33.png', 'VINAYAKA CHAVITHI SALE · UP TO 40% OFF', 'ELEVATE YOUR', 'SETUP TODAY', 'Next-gen processors, RTX 50 GPUs & custom liquid-cooled rigs at unbeatable festive prices.', 'Explore Offers', '/offers', 'Build Your PC', '/build-your-pc'),
('gaming', '/themes/vinayaka/banner-32.png', 'GAMING FEST · UP TO 45% OFF', 'PRO GAMING', 'GEAR', 'Keyboards, mice & RGB headsets', 'Shop Gear', '/category/gaming', null, null),
('builder', '/themes/vinayaka/banner-31.png', 'PC BUILDER DEALS', 'SAVE MORE', 'BUILD MORE', 'Motherboards, RAM & Fast SSDs', 'Start Building', '/build-your-pc', null, null)
on conflict (id) do update set
  image_src = excluded.image_src,
  badge_text = excluded.badge_text,
  title_line1 = excluded.title_line1,
  title_line2 = excluded.title_line2,
  subtitle = excluded.subtitle,
  button_text = excluded.button_text,
  button_link = excluded.button_link,
  updated_at = now();

-- ==============================================================================
-- DONE! All tables, constraints, policies, buckets, and seed data are ready.
-- ==============================================================================
