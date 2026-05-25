import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY
});

export async function POST(req) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, planName } = await req.json();

    const parameter = {
      transaction_details: {
        order_id: `LUNASIN-${user.id.slice(0, 8)}-${Date.now()}`,
        gross_amount: amount || 99000
      },
      item_details: [{
        id: "UPGRADE-PRO",
        price: amount || 99000,
        quantity: 1,
        name: `Lunasin Pro Plan - ${planName || 'Standard'}`
      }],
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
