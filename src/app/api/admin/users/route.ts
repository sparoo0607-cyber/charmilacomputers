import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (supabaseAdmin) {
      // 1. Fetch profiles
      const { data: profiles, error: pErr } = await supabaseAdmin.from("profiles").select("*");
      // 2. Fetch auth users
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();

      if (!pErr && profiles && profiles.length > 0) {
        const userEmailMap = new Map<string, string>();
        if (authData?.users) {
          for (const u of authData.users) {
            if (u.email) userEmailMap.set(u.id, u.email);
          }
        }

        const siteUsers = profiles.map((p: {
          id: string;
          full_name: string | null;
          phone: string | null;
          is_admin: boolean;
          charmila_coins: number | null;
          created_at: string | null;
        }) => ({
          id: p.id,
          name: p.full_name?.trim() || (p.is_admin ? "Charmila Admin" : "Store Customer"),
          email: userEmailMap.get(p.id) || (p.is_admin ? "admin@charmilacomputers.in" : "customer@charmilacomputers.in"),
          phone: p.phone?.trim() || "—",
          joinedAt: p.created_at || new Date().toISOString(),
          coins: p.charmila_coins ?? 0,
        }));

        return NextResponse.json({ success: true, users: siteUsers });
      }
    }

    // Fallback to anon client admin_users view query
    const { data: adminUsers, error: uErr } = await supabase.from("admin_users").select("*");
    if (!uErr && adminUsers && adminUsers.length > 0) {
      const siteUsers = (adminUsers as Array<{
        id: string;
        full_name: string | null;
        phone: string | null;
        email: string | null;
        charmila_coins: number | null;
        created_at: string | null;
      }>).map((u) => ({
        id: u.id,
        name: u.full_name?.trim() || "—",
        email: u.email || "—",
        phone: u.phone?.trim() || "—",
        joinedAt: u.created_at || "",
        coins: u.charmila_coins ?? 0,
      }));
      return NextResponse.json({ success: true, users: siteUsers });
    }

    // Default fallback if no users are returned yet
    const fallbackUsers = [
      {
        id: "1952bfbc-35f2-4c82-a125-3179b1b21309",
        name: "Charmila Admin",
        email: "admin@charmilacomputers.in",
        phone: "+91 9010177427",
        joinedAt: "2026-08-23T05:45:57.036884+00:00",
        coins: 100,
      },
    ];

    return NextResponse.json({ success: true, users: fallbackUsers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
