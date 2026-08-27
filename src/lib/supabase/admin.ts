import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY Supabase client, backed by the service-role key.
//
// This bypasses Row Level Security, so it must NEVER be imported into a client
// component or anything that ends up in the browser bundle. It is only used by
// route handlers under src/app/api/** to perform trusted writes (e.g. persisting
// the active storefront theme) that would otherwise be blocked by the
// "admins write" RLS policies — the API route has no end-user auth context.
//
// If SUPABASE_SERVICE_ROLE_KEY is not set (e.g. it wasn't added to the Vercel
// project env), this is `null` and callers fall back to the anon client.
// ─────────────────────────────────────────────────────────────────────────────

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient<Database> | null = null;

if (typeof window === "undefined" && url && serviceRoleKey) {
  client = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = client;
