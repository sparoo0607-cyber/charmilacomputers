import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

// Uses service-role key to bypass RLS for admin product operations.
// This is safe because this route is only called from the admin panel.

const writer = supabaseAdmin ?? supabase;

// POST /api/admin/products — insert a new product
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await writer.from("products").insert({
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
    }).select().single();

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
    const body = await req.json();
    const { id, ...patch } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    const { error } = await writer.from("products").update(patch).eq("id", id);

    if (error) {
      console.error("[admin/products] update error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "id required" }, { status: 400 });
    }

    const { error } = await writer.from("products").delete().eq("id", id);

    if (error) {
      console.error("[admin/products] delete error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
