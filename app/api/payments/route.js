import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { debt_id, amount, payment_date, notes } = body;

    if (Number(amount) <= 0) return NextResponse.json({ error: "Jumlah pembayaran harus lebih dari 0." }, { status: 400 });
    if (!debt_id) return NextResponse.json({ error: "Hutang tidak valid." }, { status: 400 });

    // Pastikan debt_id milik user yang login (cegah manipulasi hutang orang lain)
    const { data: debtCheck } = await supabase
      .from("debts")
      .select("id")
      .eq("id", debt_id)
      .eq("user_id", user.id)
      .single();
    if (!debtCheck) return NextResponse.json({ error: "Hutang tidak ditemukan." }, { status: 404 });

    // 1. Catat ke tabel payments
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([{
        user_id: user.id,
        debt_id,
        amount: Number(amount),
        payment_date,
        notes: notes || null
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Sisa hutang dipotong otomatis oleh trigger `on_payment_created` di database.

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
