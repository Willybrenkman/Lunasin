import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const DUMMY_DATA = [
  { id: 1, name: "Shopee PayLater", total: 1500000, sisa: 300000, interest: 0, min_payment: 300000, jatuh_tempo: null },
  { id: 2, name: "Kartu Kredit BCA", total: 5000000, sisa: 3200000, interest: 16, min_payment: 500000, jatuh_tempo: "2024-07-10" },
  { id: 3, name: "Kredit Motor Honda", total: 12000000, sisa: 4600000, interest: 11, min_payment: 600000, jatuh_tempo: "2024-08-15" },
  { id: 4, name: "Pinjaman Online A", total: 2000000, sisa: 1100000, interest: 24, min_payment: 300000, jatuh_tempo: "2024-07-05" },
  { id: 5, name: "Kredivo", total: 3000000, sisa: 1000000, interest: 0, min_payment: 250000, jatuh_tempo: null },
  { id: 6, name: "Pinjaman Teman", total: 1000000, sisa: 1000000, interest: 0, min_payment: 200000, jatuh_tempo: null }
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_")) return null;
  return createClient(url, key);
}

export async function GET(req) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ data: DUMMY_DATA });

  try {
    // Ambil user dari header Authorization jika ada
    const authHeader = req.headers.get('authorization');
    
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ data: DUMMY_DATA });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ data: DUMMY_DATA });
  }
}

export async function POST(req) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Database belum terhubung" }, { status: 503 });
  }

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
