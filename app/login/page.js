"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Baca ?error= dari URL (misal dari auth callback)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(decodeURIComponent(urlError));
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInErr) {
        setError("Email atau password salah. Hubungi admin jika belum punya akun.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080A] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in duration-700">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-gold rounded-[1.2rem] flex items-center justify-center shadow-2xl shadow-gold/20">
            <Wallet className="text-black" size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Lunaskan.online</h1>
          <p className="text-gray-500 text-sm text-center font-medium">
            Masuk dengan akun yang diberikan admin
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0B0F14] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="email kamu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password kamu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-bold text-red-400 bg-red-500/5 py-3 px-4 rounded-xl border border-red-500/10 text-center">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full bg-gold text-black font-black py-4 rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Memverifikasi...</>
                : <>Masuk <ArrowRight size={18} /></>
              }
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-2 flex-wrap">
          Belum punya akun?
          <a
            href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.online,%20saya%20ingin%20mendaftar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold font-black hover:underline"
          >
            Hubungi Admin
          </a>
        </p>

      </div>
    </div>
  );
}
