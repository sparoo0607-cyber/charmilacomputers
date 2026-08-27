# Charmila Computers — Backend Fix Pass (2026-08-27)

End-to-end check of the storefront + Supabase backend, with the backend bugs fixed.
Frontend / UI / UX was left as-is per the brief.

---

## TL;DR — what was broken and what changed

| # | Symptom | Root cause | Fix |
|---|---------|-----------|-----|
| 1 | **Every product page and every category page returned HTTP 500** | Products in Supabase carry `image_url`s on the Supabase Storage host (`…supabase.co/storage/v1/object/public/…`). `next/image` throws for any remote host not whitelisted, and nothing whitelisted it. | Added `images.remotePatterns` for `**.supabase.co/storage/v1/object/public/**` in `next.config.ts`. |
| 2 | **Admin "Themes" toggle looked like it did nothing; storefront stuck on one theme** | `store_settings.active_theme` in the DB held the value `"festival"` — not one of the two ids the app understands (`festive` / `standard`), so every check fell through to the fallback. | `supabase/fix_backend.sql` coerces the value and adds a `CHECK` constraint. New `src/lib/theme.ts` `normalizeTheme()` is now used everywhere a theme value is read, so a bad value can never wedge the store again. |
| 3 | **Theme never synced on Vercel** even when the DB was correct | `/api/theme` treated a `/tmp` JSON file as the source of truth. On Vercel `/tmp` is wiped between cold starts, and the missing-file fallback stamped `updatedAt = now()`, so the Supabase value (older timestamp) was always rejected. | `/api/theme` GET now reads Supabase first and only falls back to the file if Supabase is unreachable. POST writes to Supabase (service-role client, so it passes RLS) and keeps the file as a media-only cache. |
| 4 | **`store_settings` / `banners` were writable with the public anon key** | RLS on the deployed DB didn't match `supabase/full_setup.sql` (it was set up from an older script). Anyone could rename the store or swap every banner. | `fix_backend.sql` drops every policy on those two tables and recreates the intended "public read / admins write" pair. |
| 5 | GPU product `gpu-2` showed a broken image | `ProductImage` map pointed at `gpu-2-rtx-3060.png`, which doesn't exist in `public/images/products/`. | Repointed to an existing asset. |
| 6 | Type drift | `store_settings` TS type was missing the `gstin` column. | Added. |

Verified after the fixes: `npm run build` passes, `tsc --noEmit` clean, and every route
(`/`, `/product/[id]`, `/category/[slug]`, `/search`, `/cart`, `/admin`, …) returns 200.

---

## YOU MUST DO THESE before the client demo

### 1. Run the SQL fix (once)

Supabase Dashboard → SQL Editor → New query → paste **`supabase/fix_backend.sql`** → Run.
It is idempotent (safe to run more than once). It:
- fixes `store_settings.active_theme` and constrains it,
- re-locks `store_settings` + `banners` writes to admins,
- deletes leftover `__test…` probe rows.

(`supabase/full_setup.sql` was also patched for fresh installs — no need to re-run it if the DB already exists, but harmless if you do.)

### 1b. Run the analytics SQL (once)

Supabase Dashboard → SQL Editor → New query → paste **`supabase/analytics_setup.sql`** → Run.
Also idempotent. It:
- creates `page_views` (storefront traffic log — anon insert, admin-only read),
- creates the `admin_users` view (profiles ⨝ auth.users, admin-only) that the
  admin **Users** screen and dashboard read for name / mobile / email.

Until this runs, the admin dashboard shows an "Analytics not live yet" notice
and the Users list is empty — the storefront itself is unaffected.

### 2. Set the server-only env var (local + Vercel)

`.env.local` already has it for local dev:

```
SUPABASE_SERVICE_ROLE_KEY=...        # NO NEXT_PUBLIC_ prefix — server only
```

**Add the same var in Vercel → Project → Settings → Environment Variables**
(Production + Preview). Without it, after step 1 the admin theme toggle can no
longer persist to Supabase (the anon key is now blocked by RLS, by design).
`/api/theme` reports `"persisted": false` in its JSON response if this is missing.

> Security note: the service-role key bypasses RLS. It is only imported by
> `src/app/api/theme/route.ts` via `src/lib/supabase/admin.ts`, which is guarded
> to never run in the browser. Do not import it anywhere client-side. `.env*` is
> gitignored — the key is not in the repo.

### 3. Admin login password

Admin access is gated by `profiles.is_admin` in Supabase. The one admin account is:

```
admin@charmilacomputers.in   (profiles.is_admin = true, email confirmed)
```

If you don't know its password, reset it in
**Supabase Dashboard → Authentication → Users → admin@charmilacomputers.in → Reset password**.
Product / order / banner edits in the admin panel only persist to the database
when logged in as this real Supabase user. (There is a localStorage "demo admin"
fallback for viewing the panel UI without a session — it cannot write to the DB
because RLS requires a real `is_admin` session.)

---

## Files changed

**Code**
- `next.config.ts` — `images.remotePatterns` for Supabase Storage
- `src/lib/theme.ts` — *new*; `ThemeId`, `normalizeTheme()`, `isThemeId()`
- `src/lib/supabase/admin.ts` — *new*; server-only service-role client (null if key unset)
- `src/app/api/theme/route.ts` — Supabase is the source of truth; service-role write
- `src/hooks/useStoreTheme.ts` — routes every external value through `normalizeTheme()`
- `src/context/AdminContext.tsx` — same
- `src/components/HeroCarousel.tsx` — comment/lint only
- `src/components/ProductImage.tsx` — fix `gpu-2` asset path
- `src/lib/supabase/types.ts` — add `store_settings.gstin`

**SQL / config**
- `supabase/fix_backend.sql` — *new*; run this once (see step 1)
- `supabase/full_setup.sql` — `active_theme` CHECK + default `standard` for fresh installs
- `.env.example` — documents `SUPABASE_SERVICE_ROLE_KEY`

---

## Known, out of scope (frontend — left untouched per brief)

- 45 of 73 products in Supabase have `image_url = NULL` and fall back to local
  `public/images/**` art via `ProductImage`. Works, but if you want real photos on
  those, upload them from the admin Products page (writes to the `product-images`
  bucket).
- Homepage countdown timer ("ENDS: 18h:42m:30s") can log a React hydration
  mismatch — it renders a time-based value without a server snapshot. Cosmetic.
- Admin **Settings** page fields `taxPercent`, `standardShippingFee`,
  `lowStockThreshold`, `maintenanceMode` are local-only (not persisted to
  Supabase). `storeName / supportEmail / supportPhone / freeShippingThreshold /
  activeTheme` do persist.
- The `.next` dev server's HMR websocket fails inside the in-app browser preview
  — dev-tooling only, does not affect `npm run build` / production.
