"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wallet, Mail, Key, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Flow:
// STEP "email"   → input email → cek returning vs new user
// STEP "login"   → returning user → input password → signInWithPassword
// STEP "register"→ new user → input unix code + buat password → redeem_voucher + signUp
// STEP "confirm" → jika Supabase minta email confirmation sebelum login

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedEmail = email.trim().toLowerCase();

  // Baca ?error= dari URL (redirect dari auth/callback jika link expired)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(decodeURIComponent(urlError));
  }, [searchParams]);

  // ── STEP 1: cek email ────────────────────────────────────────────
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: hasVoucher, error: rpcErr } = await supabase.rpc(
        "check_email_has_voucher",
        { p_email: normalizedEmail }
      );
      if (rpcErr) {
        setError("Tidak bisa terhubung ke server. Coba lagi.");
        return;
      }
      setStep(hasVoucher ? "login" : "register");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP login: email + password ─────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInErr) {
        setError("Email atau password salah. Coba lagi.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP register: unix code + buat password ─────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi tidak cocok.");
      return;
    }

    setLoading(true);
    const normalizedCode = code.trim().toUpperCase();

    try {
      // 1. Validasi & claim unix code
      const { data: result, error: rpcErr } = await supabase.rpc(
        "redeem_voucher",
        { p_email: normalizedEmail, p_code: normalizedCode }
      );
      if (rpcErr || !result?.success) {
        setError(result?.error || "Kode unix tidak valid atau sudah digunakan.");
        return;
      }

      // 2. Daftar akun baru
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });
      if (signUpErr) {
        setError(signUpErr.message || "Gagal membuat akun. Coba lagi.");
        return;
      }

      // 3. Jika session langsung ada (autoconfirm ON) → redirect
      if (signUpData.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // 4. Coba langsung login (kalau autoconfirm OFF tapi bisa login)
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (!signInErr) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // 5. Supabase minta konfirmasi email dulu
      setStep("confirm");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
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
          <h1 className="text-2xl font-black tracking-tight">Lunasin.id</h1>
        </div>

        {/* Card */}
        <div className="bg-[#0B0F14] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full -mr-16 -mt-16" />

          {/* ── STEP: email ── */}
          {step === "email" && (
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black mb-2">Masuk ke Akun Anda</h2>
                <p className="text-gray-500 text-sm font-medium">Masukkan email untuk melanjutkan</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <Field label="Email">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="masukkan email kamu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={loading}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                    />
                  </div>
                </Field>
                <SubmitButton loading={loading} loadingText="Memeriksa...">
                  Lanjutkan <ArrowRight size={18} />
                </SubmitButton>
              </form>
            </div>
          )}

          {/* ── STEP: login (returning user) ── */}
          {step === "login" && (
            <div className="relative z-10">
              <BackButton onClick={() => { setStep("email"); setError(""); setPassword(""); }} />
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20">
                  <Lock className="text-gold" size={28} />
                </div>
                <h2 className="text-2xl font-black mb-2">Masukkan Password</h2>
                <p className="text-gold/60 text-sm font-medium">{email}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <Field label="Password">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="masukkan password kamu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      autoFocus
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
                <SubmitButton loading={loading} loadingText="Memverifikasi...">
                  Masuk <ArrowRight size={18} />
                </SubmitButton>
              </form>
            </div>
          )}

          {/* ── STEP: register (new user) ── */}
          {step === "register" && (
            <div className="relative z-10">
              <BackButton onClick={() => { setStep("email"); setError(""); setCode(""); setPassword(""); setConfirmPassword(""); }} />
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20">
                  <Key className="text-gold" size={28} />
                </div>
                <h2 className="text-2xl font-black mb-2">Aktivasi Akun</h2>
                <p className="text-gray-500 text-sm font-medium">Masukkan kode unix & buat password</p>
                <p className="text-gold/60 text-xs mt-2 font-medium">{email}</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-5">
                <Field label="Kode Unix">
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="cth: LNSN-XXXX-XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      autoComplete="off"
                      required
                      disabled={loading}
                      autoFocus
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-mono font-bold text-lg tracking-widest uppercase"
                    />
                  </div>
                </Field>
                <Field label="Buat Password">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>
                <Field label="Konfirmasi Password">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="ulangi password kamu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                    />
                  </div>
                </Field>
                <SubmitButton loading={loading} loadingText="Membuat akun...">
                  Aktivasi & Masuk <ArrowRight size={18} />
                </SubmitButton>
              </form>
            </div>
          )}

          {/* ── STEP: confirm email ── */}
          {step === "confirm" && (
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#22C55E]/20">
                <CheckCircle2 className="text-[#22C55E]" size={32} />
              </div>
              <h2 className="text-2xl font-black mb-3">Konfirmasi Email</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">Akun berhasil dibuat! Cek email di</p>
              <p className="text-gold font-black text-sm mb-6 break-all">{email}</p>
              <p className="text-gray-500 text-xs leading-relaxed mb-8">
                Klik link konfirmasi di email, lalu kembali ke sini untuk login. Cek folder spam jika tidak muncul.
              </p>
              <button
                onClick={() => { setStep("login"); setPassword(""); setError(""); }}
                className="w-full bg-gold text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Sudah Konfirmasi → Login
              </button>
            </div>
          )}

          {/* Error display */}
          {error && (
            <p className="mt-6 text-center text-sm font-bold text-red-400 bg-red-500/5 py-3 px-4 rounded-xl border border-red-500/10 relative z-10">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        {step !== "confirm" && (
          <div className="flex flex-col gap-3">
            <p className="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-2 flex-wrap">
              Belum punya kode unix?
              <a
                href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunasin.id,%20saya%20ingin%20membeli%20lisensi%20PRO"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-black hover:underline"
              >
                Beli Sekarang
              </a>
            </p>
            <p className="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-2 flex-wrap">
              Butuh bantuan?
              <a
                href="https://wa.me/6289627314790?text=Halo%20Admin%20Lunasin.id,%20saya%20butuh%20bantuan%20login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#22C55E] font-black hover:underline"
              >
                Hubungi CS
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">{label}</label>
      {children}
    </div>
  );
}

function SubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gold text-black font-black py-4 rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
    >
      {loading ? <><Loader2 size={18} className="animate-spin" />{loadingText}</> : children}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-gray-500 hover:text-gold text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
    >
      <ArrowLeft size={14} /> Ganti email
    </button>
  );
}
