import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pastikan URL valid atau gunakan placeholder yang benar agar tidak crash
const safeUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : "https://placeholder-project.supabase.co";

const safeKey = supabaseAnonKey || "placeholder-key";

if (!supabaseUrl || supabaseUrl.includes("YOUR_")) {
  console.warn("⚠️ Supabase credentials missing. Running in Demo Mode.");
}

// Browser client — untuk digunakan di "use client" components
// createBrowserClient dari @supabase/ssr otomatis mengelola session via cookies
export const supabase = createBrowserClient(safeUrl, safeKey);
