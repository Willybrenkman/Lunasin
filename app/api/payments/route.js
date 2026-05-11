import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const supabase = await createSupabaseServerClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { debt_id, amount, payment_date, notes } = body;

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
