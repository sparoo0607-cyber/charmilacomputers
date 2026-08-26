# Folder Audit — mdcomputers-clone

Date: 2026-08-14

## 1. Overview

Next.js 16 / React 19 e-commerce storefront ("MD Computers clone"). TypeScript strict mode,
Tailwind v4, App Router. No backend/DB — all data is static (`src/data/*.ts`) and cart/wishlist
state lives in `localStorage` via `CartContext`.

- **Dependencies**: minimal — `next`, `react`, `react-dom` only (no UI libs, no state libs, no
  test framework). Dev deps are just the standard Next/ESLint/Tailwind/TS toolchain.
- **No `.env` files, no secrets, no API keys found** in the repo.
- **`node_modules`**: 407 MB (gitignored, fine).
- **`.next`** build output exists locally (gitignored, fine).

## 2. Structure

```
src/
  app/            22 routes (about, account, build-your-pc, cart, category/[slug],
                   checkout, compare, contact, deals, login, order-success, product/[id],
                   register, search, track, warranty-rma, wishlist) + manifest/robots/sitemap
  components/     Header, Footer, HeroCarousel, ProductCard, ProductImage, CompareDrawer,
                   Toast, icons
  context/        CartContext.tsx (cart + wishlist, localStorage-backed)
  data/           products.ts (1713 lines), categories.ts, types.ts
  lib/            format.ts
public/
  images/, banners/   86.7 MB of product/category/banner art
DIMG/             68.1 MB — 33 "ChatGPT Image ..." PNGs, dated Aug 8–9 2026
```

**Largest source files**: `src/data/products.ts` (1713 lines), `src/app/page.tsx` (1210),
`src/app/build-your-pc/BuildYourPc.tsx` (834), `src/app/checkout/page.tsx` (737),
`src/components/Header.tsx` (594).

## 3. Git status

- Tracked-but-modified: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/data/types.ts` (net +1547/−78 lines vs. last commit — page.tsx alone is +1251/−? lines).
- **Everything else is untracked** (`??`): the entire `src/app` route tree except the 4 files
  above, `src/components/`, `src/context/`, `src/data/categories.ts` + `products.ts`, `src/lib/`,
  `public/images/`, `public/banners/`, `DIMG/`, `.claude/`.
- Only one commit exists in the repo (`3ef3fe3 Initial commit from Create Next App`) — so in
  effect **the entire application has never been committed**. Everything is sitting as
  uncommitted working-tree changes.

## 4. Build/lint health

- `tsc --noEmit`: **clean, 0 errors.**
- `next lint` / eslint: **1 error, 57 warnings.**
  - **Error** (real bug): [CartContext.tsx:155](src/context/CartContext.tsx:155) — `setLines()` /
    `setWishlist()` are called synchronously inside a `useEffect` body that reads from
    `localStorage` on mount. React's `react-hooks/set-state-in-effect` rule flags this as a
    cascading-render anti-pattern. Low severity in practice (it's a one-time hydration read) but
    worth wrapping in `useState(() => ...)` lazy init or `useSyncExternalStore` instead of an
    effect.
  - **Warnings**: all 57 are `no-unused-vars` — unused icon imports (`BoltIcon`, `CheckIcon`,
    `ShieldCheckIcon`, etc.) left over in ~16 files after copy/paste between pages, plus one
    unused `ProductReview` type in `data/products.ts` and unused `products`/`Link` imports in
    `compare/page.tsx` and `CategoryBrowser.tsx`. Cosmetic — safe bulk cleanup candidate.

## 5. Notable items / risks

1. **`DIMG/` (68 MB) looks like a scratch/export folder**, not consumed by any code
   (`grep -r "DIMG" src` → no matches). Filenames are raw ChatGPT export names
   (`ChatGPT Image Aug 8, 2026, 09_26_16 PM.png`). Likely safe to delete or move out of the repo
   before committing — as-is it would add 68 MB to the first real commit.
2. **`public/images/` (86.7 MB) is large for a demo app** but *is* referenced throughout
   (`ProductImage.tsx` builds paths like `/images/${categorySlug}.png`) — this one is live,
   just heavy. Consider compressing (PNGs of banners/hero art are prime candidates) if repo size
   or load time matters.
3. **AGENTS.md constraint**: the project's own `AGENTS.md` states this Next.js version has
   "breaking changes" vs. the version in training data and instructs reading
   `node_modules/next/dist/docs/` before writing code — flagging this so it isn't missed on
   future changes.
4. **Nothing is committed.** `git log` shows only the CNA scaffold commit; every feature (cart,
   checkout, all 22 routes, all data, all images) is uncommitted. If a laptop crash / `git reset
   --hard` happened right now, all of it would be lost. Recommend committing in logical chunks
   soon (e.g. data layer → components → routes → assets), after deciding whether `DIMG/` should
   be excluded.
5. No tests exist anywhere in the repo (no `*.test.*`, `*.spec.*`, or test runner configured).

## 6. Suggested next actions (not yet done)

- [ ] Decide fate of `DIMG/` (delete vs. `.gitignore` vs. move outside repo).
- [ ] Fix the `set-state-in-effect` bug in [CartContext.tsx](src/context/CartContext.tsx:155).
- [ ] Run an unused-import cleanup pass (`eslint --fix` handles most of the 57 warnings).
- [ ] Commit the working tree — nothing beyond the CNA scaffold is in git history yet.
- [ ] Consider compressing `public/images/*.png` (many are uncompressed PNGs for photographic
      content that would be smaller as `.webp`/`.jpg`).
