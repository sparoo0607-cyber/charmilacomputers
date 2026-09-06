import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// This route uses Supabase's REST API via the service-role key to run raw SQL
// that drops the old CHECK constraint (which only allowed 'festive'/'standard')
// and replaces it with one that also accepts 'dussara-d1' through 'dussara-d9'.
export async function POST() {
  const writer = supabaseAdmin;
  if (!writer) {
    return NextResponse.json(
      { success: false, error: "Service-role key not configured (SUPABASE_SERVICE_ROLE_KEY missing). Run the SQL manually in the Supabase Dashboard." },
      { status: 500 }
    );
  }

  const results: string[] = [];
  let anyError = false;

  // Step 1: Try to update the current row to a valid value first (in case it's stuck on a bad value)
  try {
    const { error } = await writer
      .from("store_settings")
      .update({ active_theme: "standard" })
      .eq("id", "default")
      .eq("active_theme", "festival"); // only fix the bad "festival" value
    if (!error) results.push("✓ Coerced stale 'festival' → 'standard'");
  } catch {}

  // Step 2: Drop old constraint and add new one using pg_meta RPC (Supabase REST DDL)
  // We can't run raw SQL directly via the JS client — use the REST Management API instead
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const sql = `
    ALTER TABLE public.store_settings
      DROP CONSTRAINT IF EXISTS store_settings_active_theme_check;
    ALTER TABLE public.store_settings
      ADD CONSTRAINT store_settings_active_theme_check
      CHECK (active_theme IN ('festive', 'standard') OR active_theme LIKE 'dussara-d%');
  `;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (res.ok) {
      results.push("✓ Constraint updated via exec_sql RPC");
    } else {
      // exec_sql not available — try pg_dump endpoint or note it needs manual execution
      const err = await res.text();
      results.push(`ℹ exec_sql not available (${res.status}): ${err.slice(0, 100)}`);
      anyError = true;
    }
  } catch (e) {
    results.push(`ℹ exec_sql error: ${e}`);
    anyError = true;
  }

  // Step 3: Even if DDL failed, ensure the row is writable by trying a direct upsert
  // (Supabase may already have the constraint updated from fix_backend.sql)
  try {
    const { error } = await writer.from("store_settings").upsert({
      id: "default",
      active_theme: "dussara-d1",
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      results.push("✓ Constraint already allows dussara themes (test upsert succeeded)");
      anyError = false;
      // Revert to standard
      await writer.from("store_settings").upsert({
        id: "default",
        active_theme: "standard",
        updated_at: new Date().toISOString(),
      });
    } else {
      results.push(`✗ Constraint still blocking: ${error.message}`);
      results.push("→ Please run update_theme_constraint.sql manually in Supabase Dashboard → SQL Editor");
    }
  } catch (e) {
    results.push(`ℹ Test upsert error: ${e}`);
  }

  return NextResponse.json({
    success: !anyError,
    results,
    manualSql: `
-- Run this in Supabase Dashboard → SQL Editor:
ALTER TABLE public.store_settings
  DROP CONSTRAINT IF EXISTS store_settings_active_theme_check;
ALTER TABLE public.store_settings
  ADD CONSTRAINT store_settings_active_theme_check
  CHECK (active_theme IN ('festive', 'standard') OR active_theme LIKE 'dussara-d%');
    `.trim(),
  });
}
