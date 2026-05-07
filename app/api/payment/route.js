import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || "YOUR_SERVER_KEY"
});

export async function POST(req) {
  try {
    const { amount, planName } = await req.json();

    const parameter = {
      transaction_details: {
        order_id: `LUNASIN-${Date.now()}`,
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
        first_name: "User",
        email: "user@example.com"
      }
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({ 
      token: transaction.token,
      redirect_url: transaction.redirect_url 
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
