import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, total, interest, min_payment, tanggal_mulai, jatuh_tempo, tanggal_tagihan, notes } = body;

    const { data, error } = await supabase
      .from("debts")
      .insert([
        {
          user_id: user.id,
          name,
          total: Number(total),
          sisa: Number(total),
          interest: Number(interest),
          min_payment: Number(min_payment),
          tanggal_mulai: tanggal_mulai || null,
          jatuh_tempo: jatuh_tempo || null,
          tanggal_tagihan: tanggal_tagihan ? Number(tanggal_tagihan) : null,
          notes
        }
      ]).select();

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
    const { id, name, total, sisa, interest, min_payment, tanggal_mulai, jatuh_tempo, tanggal_tagihan, status, notes } = body;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updateData = {
      name,
      total: Number(total),
      sisa: Number(sisa),
      interest: Number(interest),
      min_payment: Number(min_payment),
      tanggal_mulai: tanggal_mulai || null,
      jatuh_tempo: jatuh_tempo || null,
      tanggal_tagihan: tanggal_tagihan ? Number(tanggal_tagihan) : null,
      status,
      notes
    };

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
