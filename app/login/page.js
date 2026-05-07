"use client";

import { useState } from "react";
import { Wallet, Mail, Key, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Alur:
// STEP 1 (email):
//   User input email -> sistem cek apakah email sudah punya voucher claimed
//     -> SUDAH (returning user): langsung kirim magic link, pindah ke STEP 3
//     -> BELUM (first-time user): pindah ke STEP 2 untuk minta unix code
// STEP 2 (unix code):
//   User input unix code -> sistem validasi & claim voucher
//     -> sukses: kirim magic link, pindah ke STEP 3
//     -> gagal: tampilkan error, user bisa retry
// STEP 3 (sent):
//   Tampilkan instruksi cek email + tombol "kirim ulang"

export default function LoginPage() {
  const [step, setStep] = useState(1); // 1=email, 2=unix code, 3=link sent
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------------------------------
  // STEP 1: cek email -> tentukan first-time atau returning user
  // ---------------------------------------------------------------
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      // Cek apakah email sudah punya voucher claimed
      const { data: hasVoucher, error: rpcErr } = await supabase.rpc(
        "check_email_has_voucher",
        { p_email: normalizedEmail }
      );

      if (rpcErr) {
        console.error(rpcErr);
        setError("Tidak bisa terhubung ke server. Coba lagi.");
        setLoading(false);
        return;
      }

      if (hasVoucher) {
        // Returning user -> langsung kirim magic link
        await sendMagicLink(normalizedEmail);
      } else {
        // First-time user -> minta unix code
        setStep(2);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // STEP 2: validasi unix code -> claim voucher -> kirim magic link
  // ---------------------------------------------------------------
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setError("Kode unix wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      // Validasi & claim voucher (atomic via RPC)
      const { data: result, error: rpcErr } = await supabase.rpc(
        "redeem_voucher",
        { p_email: normalizedEmail, p_code: normalizedCode }
      );

      if (rpcErr) {
        console.error(rpcErr);
        setError("Tidak bisa terhubung ke server. Coba lagi.");
        setLoading(false);
        return;
      }

      if (!result?.success) {
        setError(result?.error || "Kode unix tidak valid.");
        setLoading(false);
        return;
      }

      // Voucher berhasil di-claim -> kirim magic link
      await sendMagicLink(normalizedEmail);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Helper: kirim magic link via Supabase
  // ---------------------------------------------------------------
  const sendMagicLink = async (targetEmail) => {
    try {
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // shouldCreateUser=true (default) -> Supabase otomatis create user kalau belum ada
        },
      });

      if (otpErr) {
        console.error(otpErr);
        setError(otpErr.message || "Gagal mengirim link login.");
        setLoading(false);
        return;
      }

      setStep(3);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim link login. Coba lagi.");
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------
  // Helper: kirim ulang magic link
  // ---------------------------------------------------------------
  const handleResend = async () => {
    setError("");
    setLoading(true);
    await sendMagicLink(email.trim().toLowerCase());
  };

  // ---------------------------------------------------------------
  // Helper: kembali ke step 1
  // ---------------------------------------------------------------
  const handleBack = () => {
    setError("");
    setCode("");
    setStep(1);
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

          {/* ================= STEP 1: Email ================= */}
          {step === 1 && (
            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black mb-2">Masuk ke Akun Anda</h2>
                <p className="text-gray-500 text-sm font-medium">
                  Masukkan email untuk melanjutkan
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors"
                      size={18}
                    />
                    <input
                      type="email"
                      placeholder="masukkan email kamu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-medium"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-gold text-black font-black py-4 rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memeriksa...
                    </>
                  ) : (
                    <>
                      Lanjutkan <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 2: Unix Code ================= */}
          {step === 2 && (
            <div className="relative z-10">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 text-gray-500 hover:text-gold text-xs font-bold uppercase tracking-widest mb-6 transition-colors disabled:opacity-50"
              >
                <ArrowLeft size={14} /> Ganti email
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20">
                  <Key className="text-gold" size={28} />
                </div>
                <h2 className="text-2xl font-black mb-2">Masukkan Kode Unix</h2>
                <p className="text-gray-500 text-sm font-medium">
                  Kode unix yang Anda terima setelah pembelian
                </p>
                <p className="text-gold/60 text-xs mt-2 font-medium">{email}</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">
                    Kode Unix
                  </label>
                  <div className="relative group">
                    <Key
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="cth: LNSN-XXXX-XXXX"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      autoComplete="off"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold/50 focus:bg-white/[0.05] transition-all font-mono font-bold text-lg tracking-widest uppercase"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !code.trim()}
                  className="w-full bg-gold text-black font-black py-4 rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Memvalidasi...
                    </>
                  ) : (
                    <>
                      Aktivasi & Kirim Link <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================= STEP 3: Magic Link Sent ================= */}
          {step === 3 && (
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#22C55E]/20">
                <CheckCircle2 className="text-[#22C55E]" size={32} />
              </div>
              <h2 className="text-2xl font-black mb-3">Cek Email Anda</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-2">
                Kami sudah mengirim link login ke
              </p>
              <p className="text-gold font-black text-sm mb-8 break-all">{email}</p>
              <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">
                Klik link di email untuk masuk ke dashboard. Link berlaku selama 60 menit.
                Jangan lupa cek folder spam.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Mengirim ulang...
                    </>
                  ) : (
                    "Kirim Ulang Link"
                  )}
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setEmail("");
                    setCode("");
                    setError("");
                  }}
                  className="w-full text-gray-500 hover:text-white font-bold py-2 text-xs uppercase tracking-widest transition-colors"
                >
                  Gunakan Email Lain
                </button>
              </div>
            </div>
          )}

          {/* ================= ERROR DISPLAY ================= */}
          {error && (
            <p className="mt-6 text-center text-sm font-bold text-red-400 bg-red-500/5 py-3 px-4 rounded-xl border border-red-500/10 relative z-10">
              {error}
            </p>
          )}
        </div>

        {/* Footer links */}
        {step !== 3 && (
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
