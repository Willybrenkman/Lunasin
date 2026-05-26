import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isMissing = !supabaseUrl || supabaseUrl.includes("YOUR_") || !supabaseAnonKey;
// NEXT_PHASE = "phase-production-build" saat build, undefined saat runtime
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";

if (isMissing) {
  if (process.env.NODE_ENV === "production" && !isBuildTime) {
    // Runtime production tanpa credentials = hard fail supaya tidak silent error
    throw new Error(
      "Supabase credentials wajib diisi di production. " +
      "Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di Vercel environment variables."
    );
  }
  console.warn("⚠️ Supabase credentials missing. Running in Demo Mode.");
}

const safeUrl = supabaseUrl?.startsWith("http")
  ? supabaseUrl
  : "https://placeholder-project.supabase.co";
const safeKey = supabaseAnonKey || "placeholder-key";

// Browser client — untuk digunakan di "use client" components
export const supabase = createBrowserClient(safeUrl, safeKey);
