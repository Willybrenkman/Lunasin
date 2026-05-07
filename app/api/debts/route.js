import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_")) return null;
  return createClient(url, key);
}

export async function GET(req) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ data: [] });

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
