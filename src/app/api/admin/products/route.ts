import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Admin product writes.
//
// Two things used to break every write from /admin/products:
//
//  1. The route fell back to the *anon* client when SUPABASE_SERVICE_ROLE_KEY
//     was missing (e.g. not set in the Vercel project). That fallback client
//     carries no auth context at all, so the "products: admins write" RLS
//     policy rejected every insert/update/delete. The route returned 500, the
//     browser only console.warn'd it, and the admin UI happily showed a
//     success toast — so added products never reached Supabase and deleted
//     ones came back on the next load.
//  2. With the service-role key present, the route bypassed RLS for *anyone*
//     who could hit the URL — there was no check that the caller is an admin.
//
// Now: the caller must send their Supabase access token, we verify
// profiles.is_admin for that token, and only then perform the write — using
// the service-role client when available, otherwise a client bound to the
// caller's own token (which satisfies the RLS policy on its own).
// ---------------------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://genhheydpoywoqhdavmy.supabase.co";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_HARSuR4hZyRh_PAaid1_lQ_CfgxZx42";

type Client = SupabaseClient<Database>;

function clientForToken(token: string): Client {
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/**
 * Resolves the Supabase client to write with, or an error response explaining
 * why the caller is not allowed to write.
 */
async function resolveWriter(req: Request): Promise<{ writer: Client } | { error: NextResponse }> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";

  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: "Not signed in — sign in to the admin panel again." },
        { status: 401 }
      ),
    };
  }

  const asCaller = clientForToken(token);
  const { data: userData, error: userError } = await asCaller.auth.getUser();
  if (userError || !userData?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Your admin session expired — sign in again." },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await asCaller
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  const isAdmin =
    profile?.is_admin === true ||
    userData.user.email?.toLowerCase() === "admin@charmilacomputers.in";

  if (!isAdmin) {
    return {
      error: NextResponse.json(
        { success: false, error: "This account is not an admin." },
        { status: 403 }
      ),
    };
  }

  // Service-role bypasses RLS; the caller-bound client passes it legitimately.
  return { writer: supabaseAdmin ?? asCaller };
}

// POST /api/admin/products — insert a new product
export async function POST(req: Request) {
  try {
    const resolved = await resolveWriter(req);
    if ("error" in resolved) return resolved.error;

    const body = await req.json();

    const { data, error } = await resolved.writer
      .from("products")
      .insert({
        id: body.id,
        category_slug: body.category_slug,
        name: body.name,
        brand: body.brand,
        model: body.model,
        price: body.price,
        mrp: body.mrp ?? null,
        wattage: body.wattage ?? null,
        in_stock: body.in_stock,
        stock_qty: body.stock_qty,
        rating: body.rating ?? null,
        reviews_count: body.reviews_count ?? null,
        specs: body.specs ?? null,
        features: body.features ?? null,
        image_url: body.image_url ?? null,
        images: body.images ?? (body.image_url ? [body.image_url] : null),
      })
      .select()
      .single();

    if (error) {
      console.error("[admin/products] insert error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/admin/products — update an existing product
export async function PATCH(req: Request) {
  try {
    const resolved = await resolveWriter(req);
    if ("error" in resolved) return resolved.error;

    const body = await req.json();
    const { id, ...patch } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    const { data, error } = await resolved.writer
      .from("products")
      .update(patch)
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("[admin/products] update error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // An RLS-blocked update reports no error — it simply matches zero rows.
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found, or the database rejected the update." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/admin/products — delete a product by id
export async function DELETE(req: Request) {
  try {
    const resolved = await resolveWriter(req);
    if ("error" in resolved) return resolved.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    const { data, error } = await resolved.writer
      .from("products")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("[admin/products] delete error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // This is the bug that made deleted products "come back": a delete blocked
    // by RLS deletes zero rows and reports no error. Treat that as a failure so
    // the admin UI can restore the row instead of pretending it is gone.
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: "The database did not delete this product (nothing matched, or RLS blocked it)." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
