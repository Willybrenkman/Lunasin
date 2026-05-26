import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { DEBT_TYPES } from "@/lib/debtTypes";

const VALID_DEBT_TYPES = DEBT_TYPES.map(t => t.value);
const VALID_STATUSES = ["active", "paid_off"];

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
    const { name, total, interest, min_payment, tanggal_mulai, jatuh_tempo, tanggal_tagihan, notes, debt_type } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Nama hutang wajib diisi." }, { status: 400 });
    if (Number(total) <= 0) return NextResponse.json({ error: "Total hutang harus lebih dari 0." }, { status: 400 });
    if (Number(min_payment) <= 0) return NextResponse.json({ error: "Cicilan minimum harus lebih dari 0." }, { status: 400 });
    if (Number(interest) < 0 || Number(interest) > 1000) return NextResponse.json({ error: "Bunga tidak valid." }, { status: 400 });
    if (debt_type && !VALID_DEBT_TYPES.includes(debt_type)) return NextResponse.json({ error: "Jenis hutang tidak valid." }, { status: 400 });

    const { data, error } = await supabase
      .from("debts")
      .insert([
        {
          user_id: user.id,
          name,
          debt_type: debt_type || "lainnya",
          total: Number(total),
          sisa: Number(total),
          interest: Number(interest),
          min_payment: Number(min_payment),
          tanggal_mulai: tanggal_mulai || null,
          jatuh_tempo: jatuh_tempo || null,
          tanggal_tagihan: tanggal_tagihan ? Math.max(1, Math.min(28, Number(tanggal_tagihan))) : null,
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
    const { id, name, total, sisa, interest, min_payment, tanggal_mulai, jatuh_tempo, tanggal_tagihan, status, notes, debt_type } = body;

    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!name?.trim()) return NextResponse.json({ error: "Nama hutang wajib diisi." }, { status: 400 });
    if (Number(total) <= 0) return NextResponse.json({ error: "Total hutang harus lebih dari 0." }, { status: 400 });
    if (Number(sisa) < 0 || Number(sisa) > Number(total)) return NextResponse.json({ error: "Sisa hutang tidak valid (harus antara 0 dan total hutang)." }, { status: 400 });
    if (Number(min_payment) <= 0) return NextResponse.json({ error: "Cicilan minimum harus lebih dari 0." }, { status: 400 });
    if (Number(interest) < 0 || Number(interest) > 1000) return NextResponse.json({ error: "Bunga tidak valid." }, { status: 400 });
    if (debt_type && !VALID_DEBT_TYPES.includes(debt_type)) return NextResponse.json({ error: "Jenis hutang tidak valid." }, { status: 400 });
    if (status && !VALID_STATUSES.includes(status)) return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });

    const updateData = {
      name,
      ...(debt_type && { debt_type }),
      total: Number(total),
      sisa: Number(sisa),
      interest: Number(interest),
      min_payment: Number(min_payment),
      tanggal_mulai: tanggal_mulai || null,
      jatuh_tempo: jatuh_tempo || null,
      tanggal_tagihan: tanggal_tagihan ? Math.max(1, Math.min(28, Number(tanggal_tagihan))) : null,
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

    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

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
