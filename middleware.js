import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Middleware: lindungi route /dashboard.
// Menggunakan @supabase/ssr untuk cek session secara proper,
// termasuk auto-refresh expired tokens.

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Buat response awal — kita butuh ini untuk set/update cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika env belum di-set, lewati middleware (dev mode / demo)
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR_")) {
    return response;
  }

  try {
    // Buat Supabase server client untuk middleware
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies (untuk downstream handlers)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // Re-create response dengan updated request
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          // Set cookies di response (untuk browser)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // getUser() verifikasi JWT secara proper DAN auto-refresh expired tokens
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthed = Boolean(user);

    // Protected routes
    if (pathname.startsWith("/dashboard")) {
      if (!isAuthed) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

    // Login route: kalau sudah login, lempar ke dashboard
    if (pathname === "/login" && isAuthed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect /redeem (legacy) ke /login
    if (pathname.startsWith("/redeem")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  } catch (e) {
    // Jika ada error parsing cookie / network, fallback ke behavior default
    console.error("Middleware error:", e);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/redeem/:path*"],
};
