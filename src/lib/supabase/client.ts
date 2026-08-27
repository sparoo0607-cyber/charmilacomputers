import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://genhheydpoywoqhdavmy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_HARSuR4hZyRh_PAaid1_lQ_CfgxZx42";


/**
 * Single browser client, backed by the publishable (anon) key only.
 * Every read/write goes through this and is subject to the RLS policies
 * defined in supabase/schema.sql — there is no service-role key in this app,
 * by design, since this client ships to the browser.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
