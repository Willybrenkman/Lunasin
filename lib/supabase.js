import { createClient } from "@supabase/supabase-js";

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

export const supabase = createClient(safeUrl, safeKey);
