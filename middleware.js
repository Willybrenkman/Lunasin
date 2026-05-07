import { NextResponse } from "next/server";

// Middleware: lindungi route /dashboard.
// Karena alur passwordless dan tidak ada lagi /redeem, middleware jadi sederhana:
// - /dashboard/* -> butuh session cookie, kalau tidak ada redirect ke /login
// - /login -> kalau sudah ada session, redirect ke /dashboard

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cek apakah ada session cookie dari Supabase
  const supabaseAuth = request.cookies
    .getAll()
    .find((c) => c.name.includes("sb-") && c.name.includes("-auth-token"));

  const isAuthed = Boolean(supabaseAuth);

  // Protected routes
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Login route: kalau sudah login, lempar ke dashboard
  if (pathname === "/login" && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect /redeem (legacy) ke /login
  if (pathname.startsWith("/redeem")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/redeem/:path*"],
};
