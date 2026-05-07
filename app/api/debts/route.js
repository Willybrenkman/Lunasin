import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req) {
  const supabase = await createSupabaseServerClient();

  try {
    // Ambil user dari header Authorization jika ada
    const authHeader = req.headers.get('authorization');
    
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .order('created_at', { ascending: false });

    if (error || !data) {
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req) {
  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    
    // Ambil user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData = {
      ...body,
      user_id: user?.id || null,
      sisa: body.sisa || body.total, // Sisa = total awal jika tidak diisi
    };

    const { data, error } = await supabase
      .from("debts")
      .insert([insertData])
      .select();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const supabase = await createSupabaseServerClient();
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("debts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const supabase = await createSupabaseServerClient();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
