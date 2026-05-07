import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Auth callback handler.
// Setelah user klik magic link di email, Supabase redirect ke sini dengan ?code=xxx
// Kita tukar code -> session menggunakan server client yang bisa baca/tulis cookies.

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
    return NextResponse.redirect(
      new URL("/login?error=server_misconfigured", request.url)
    );
  }

  // Buat response terlebih dahulu — kita perlu objek response untuk set cookies
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  try {
    // Buat Supabase server client dengan cookie adapter
    // Client ini bisa membaca cookie dari request (termasuk code_verifier PKCE)
    // dan menulis session cookies ke response
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookies di response agar browser menyimpannya
            response.cookies.set(name, value, {
              ...options,
              // Override opsi agar kompatibel dengan browser
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("exchangeCodeForSession error:", error);
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "Gagal memverifikasi link login. Silakan coba lagi.");
      return NextResponse.redirect(loginUrl);
    }

    // Session berhasil di-exchange — cookies sudah di-set via setAll callback
    return response;
  } catch (err) {
    console.error("Auth callback error:", err);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Terjadi kesalahan saat login.");
    return NextResponse.redirect(loginUrl);
  }
}
