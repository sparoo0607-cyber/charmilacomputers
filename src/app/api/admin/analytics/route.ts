import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = supabaseAdmin ?? supabase;
    const since = new Date(Date.now() - 30 * 864e5).toISOString();

    const { data, error } = await client
      .from("page_views")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);

    if (error) {
      console.warn("API admin analytics fetch error:", error.message);
      return NextResponse.json({ success: false, pageViews: [] });
    }

    const pageViews = (data || []).map((row: {
      id: number;
      path: string;
      kind: "home" | "category" | "product" | "other";
      slug: string | null;
      visitor_id: string | null;
      created_at: string;
    }) => ({
      id: row.id,
      path: row.path,
      kind: row.kind,
      slug: row.slug,
      visitorId: row.visitor_id,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, pageViews });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
