import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight first-party page-view logging. Writes to Supabase `page_views`
// with the anon key (insert-only per RLS — see supabase/analytics_setup.sql).
// The admin dashboard reads it back for "visitors today / top category /
// top product". Fire-and-forget: a logging failure must never affect the page.
// ─────────────────────────────────────────────────────────────────────────────

export type ViewKind = "home" | "category" | "product" | "other";

const VISITOR_KEY = "charmila_visitor_id";
const SEEN_PREFIX = "charmila_pv:"; // sessionStorage dedupe, per path

function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
        `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

// Don't re-log the same path within the same tab session.
function alreadyLogged(path: string): boolean {
  try {
    const key = SEEN_PREFIX + path;
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    return false;
  }
}

export async function logPageView(opts: { kind: ViewKind; slug?: string; path?: string }): Promise<void> {
  if (typeof window === "undefined") return;
  const path = opts.path ?? window.location.pathname;
  if (alreadyLogged(path)) return;

  try {
    await supabase.from("page_views").insert({
      path,
      kind: opts.kind,
      slug: opts.slug ?? null,
      visitor_id: getVisitorId(),
    });
  } catch {
    // network/RLS/offline — analytics is best-effort only
  }
}
