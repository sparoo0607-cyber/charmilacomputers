import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const client: any = supabaseAdmin || supabase;
    const { data, error } = await client
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ inquiries: [] });
    }

    const formatted = (data || []).map((item: {
      id: string;
      name: string;
      phone: string;
      email: string;
      subject: string;
      message: string;
      status: string;
      created_at: string;
    }) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email,
      subject: item.subject,
      message: item.message,
      status: item.status || "pending",
      createdAt: item.created_at,
    }));

    return NextResponse.json({ inquiries: formatted });
  } catch {
    return NextResponse.json({ inquiries: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || "").trim(),
      subject: String(subject || "General Inquiry").trim(),
      message: String(message).trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    // Attempt to persist to Supabase if table exists
    try {
      const client: any = supabaseAdmin || supabase;
      await client.from("contact_inquiries").insert([newInquiry]);
    } catch {
      // Graceful fallback
    }

    return NextResponse.json({ success: true, inquiry: newInquiry });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
