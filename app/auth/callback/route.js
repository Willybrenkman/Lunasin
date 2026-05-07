import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Auth callback handler.
// Setelah user klik magic link di email, Supabase redirect ke sini dengan ?code=xxx
// Kita tukar code -> session, lalu set cookie dan redirect ke /dashboard.

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const errorParam = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Jika magic link expired / invalid, redirect ke login dengan pesan
  if (errorParam) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "error",
      errorDescription || "Link tidak valid atau sudah expired."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?error=server_misconfigured", request.url));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.session) {
      console.error("exchangeCodeForSession error:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Gagal memverifikasi link login.");
      return NextResponse.redirect(loginUrl);
    }

    // Buat response redirect ke dashboard
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Set session cookie agar middleware bisa membaca status login
    // Format cookie name mengikuti standar Supabase: sb-<project-ref>-auth-token
    const projectRef = supabaseUrl
      .replace("https://", "")
      .replace(".supabase.co", "")
      .split(".")[0];

    const cookieName = `sb-${projectRef}-auth-token`;
    const cookieValue = JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: data.session.user,
    });

    response.cookies.set(cookieName, cookieValue, {
      httpOnly: false, // perlu false agar Supabase JS client bisa baca
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (err) {
    console.error("Auth callback error:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Terjadi kesalahan saat login.");
    return NextResponse.redirect(loginUrl);
  }
}
