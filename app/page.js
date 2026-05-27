"use client";

import Link from "next/link";
import {
  ArrowRight, ShieldCheck, Zap, TrendingDown, Wallet,
  CheckCircle2, BarChart3, Bell, MessageSquare, ChevronDown,
  Star, Lock, Infinity, Crown, ChevronRight
} from "lucide-react";
import { useState } from "react";

const WA_LINK = "https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.id,%20saya%20ingin%20upgrade%20ke%20PRO";
const WA_DAFTAR = "https://wa.me/6289627314790?text=Halo%20Admin%20Lunaskan.id,%20saya%20ingin%20mendaftar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060A0F] text-white overflow-x-hidden font-sans">
      <Navbar />
      <Hero />
      <TrustBar />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ─── NAVBAR ─── */
function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#060A0F]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg shadow-gold/30">
          <Wallet className="text-black" size={18} />
        </div>
        <span className="text-xl font-black tracking-tight">Lunaskan.id</span>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-gray-400">
        <a href="#fitur" className="hover:text-gold transition-colors">Fitur</a>
        <a href="#cara-kerja" className="hover:text-gold transition-colors">Cara Kerja</a>
        <a href="#harga" className="hover:text-gold transition-colors">Harga</a>
        <a href="#testimoni" className="hover:text-gold transition-colors">Testimoni</a>
        <a href="#faq" className="hover:text-gold transition-colors">FAQ</a>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/login" className="text-[13px] font-bold text-gray-400 hover:text-white transition-colors hidden sm:block">
          Masuk
        </Link>
        <a href={WA_DAFTAR} target="_blank" rel="noopener noreferrer">
          <button className="bg-[#D4AF37] text-black px-5 py-2.5 rounded-xl text-[13px] font-black shadow-lg shadow-gold/20 hover:brightness-110 transition-all">
            Daftar Sekarang
          </button>
        </a>
      </div>
    </nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  return (
    <section className="pt-40 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[500px] bg-gold/5 blur-[140px] rounded-full -z-10" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 text-gold text-[11px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
            <Zap size={12} fill="currentColor" /> Strategi Lunas Hutang Terbukti
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tighter">
            Bebas Hutang Lebih Cepat<br />
            dengan <span className="text-[#D4AF37]">Strategi Cerdas</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
            Lunaskan.id membantu kamu melacak, merencanakan, dan melunasi hutang lebih cepat menggunakan strategi Snowball, Avalanche & Smart Priority. Tidak perlu Excel yang ribet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a href={WA_DAFTAR} target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto bg-[#D4AF37] text-black px-10 py-4 rounded-2xl text-base font-black shadow-2xl shadow-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                Mulai Sekarang <ArrowRight size={18} />
              </button>
            </a>
            <Link href="/demo">
              <button className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-colors text-base">
                Lihat Demo
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-gold" /> Setup 2 menit</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-gold" /> Data aman di server Supabase</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-gold" /> Bayar sekali, akses selamanya</span>
          </div>
        </div>

        {/* App Mockup */}
        <div className="mt-20 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="relative rounded-[2rem] border border-white/10 bg-[#0B0F14] p-1 shadow-[0_0_80px_rgba(212,175,55,0.08)]">
            <div className="rounded-[1.7rem] bg-[#0B0F14] overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-[#0B0F14] border-b border-white/5 px-8 py-5 flex items-center gap-3">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
                <div className="flex-1 bg-white/5 rounded-lg h-7 mx-6 flex items-center px-4"><span className="text-[11px] text-gray-500 font-medium">lunaskan.id/dashboard</span></div>
              </div>
              {/* Mock Dashboard Content */}
              <div className="p-8 grid grid-cols-4 gap-4">
                <div className="col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Hutang", value: "Rp 45.000.000", color: "text-red-400" },
                    { label: "Sudah Dibayar", value: "Rp 12.500.000", color: "text-green-400" },
                    { label: "Est. Lunas", value: "18 Bulan", color: "text-gold" },
                    { label: "Progress", value: "27%", color: "text-blue-400" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="col-span-4 md:col-span-3 bg-white/[0.03] border border-white/5 rounded-2xl p-6 h-40 flex items-end gap-2 overflow-hidden">
                  {[60, 55, 50, 48, 42, 38, 33, 27, 22, 18, 12, 8].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%`, background: i === 11 ? '#D4AF37' : 'rgba(212,175,55,0.2)' }} />
                  ))}
                </div>
                <div className="col-span-4 md:col-span-1 space-y-3">
                  {["KTA BCA", "Kartu Kredit", "Pinjol XYZ"].map((name, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{name}</span>
                      <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md">Aktif</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── TRUST BAR ─── */
function TrustBar() {
  const stats = [
    { value: "3", label: "Strategi Pelunasan" },
    { value: "Snowball", label: "Avalanche & Smart Priority" },
    { value: "Real-Time", label: "Kalkulasi Otomatis" },
    { value: "Supabase", label: "Data Aman & Terlindungi" },
  ];
  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.01]">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-3xl font-black text-gold mb-1">{s.value}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PAIN POINTS ─── */
function PainPoints() {
  const pains = [
    { icon: "😩", title: "Bayar terus tapi hutang gak turun?", desc: "Cicilan minimum seringkali hanya menutupi bunga. Kamu butuh strategi, bukan sekadar bayar rutin." },
    { icon: "😵", title: "Bingung hutang mana yang harus dibayar dulu?", desc: "Salah prioritas = bunga makin membengkak. Kami bantu tentukan urutan yang paling efektif." },
    { icon: "📊", title: "Excel ribet dan sering salah hitung?", desc: "Lunaskan.id kalkulasi otomatis, real-time, dan tidak perlu rumus yang membingungkan." },
  ];
  return (
    <section className="py-24 px-6 bg-[#080C11]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Masalah yang Kamu Hadapi</p>
          <h2 className="text-4xl font-black tracking-tight">Apakah ini terasa familiar?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {pains.map((p, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-gold/20 transition-all">
              <div className="text-5xl mb-5">{p.icon}</div>
              <h3 className="text-lg font-black mb-3 text-white">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */
function Features() {
  const features = [
    { icon: <TrendingDown size={24} />, title: "Strategi Snowball & Avalanche", desc: "Pilih strategi yang sesuai: Snowball (hutang terkecil dulu) atau Avalanche (bunga tertinggi dulu) untuk hasil optimal." },
    { icon: <BarChart3 size={24} />, title: "Simulasi & Proyeksi Visual", desc: "Lihat grafik visual kapan kamu akan bebas hutang, dan berapa bunga yang bisa dihemat dengan extra payment." },
    { icon: <MessageSquare size={24} />, title: "Asisten Keuangan", desc: "Tanya strategi, minta estimasi lunas, atau konsultasi soal negosiasi hutang — semua dalam chat real-time." },
    { icon: <Bell size={24} />, title: "Pengingat Jatuh Tempo", desc: "Tidak pernah lupa bayar lagi. Notifikasi otomatis sebelum tanggal tagihan hutangmu." },
    { icon: <ShieldCheck size={24} />, title: "Data Aman & Privasi Terjaga", desc: "Data kamu disimpan aman di server Supabase. Hanya kamu yang bisa mengakses akun dan data hutangmu." },
    { icon: <Zap size={24} />, title: "Catat Pembayaran Real-Time", desc: "Setiap pembayaran otomatis memotong sisa hutang. Tidak perlu hitung manual atau update spreadsheet." },
  ];
  return (
    <section id="fitur" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Semua yang Kamu Butuhkan</p>
          <h2 className="text-4xl font-black tracking-tight mb-4">Fitur Lengkap untuk Bebas Hutang</h2>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">Dirancang khusus untuk membantu masyarakat Indonesia keluar dari jeratan hutang dengan cara yang terstruktur dan tidak membingungkan.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-gold/20 hover:bg-white/[0.03] transition-all group">
              <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-black mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const steps = [
    { num: "01", title: "Daftar & Masuk", desc: "Hubungi admin via WhatsApp untuk membuat akun. Proses cepat, hanya butuh 2 menit." },
    { num: "02", title: "Input Data Hutang", desc: "Masukkan semua hutangmu: nama, total, bunga, dan cicilan minimum. Bisa lebih dari satu hutang." },
    { num: "03", title: "Ikuti Strategi & Bebas Hutang", desc: "Sistem otomatis merekomendasikan strategi terbaik. Catat pembayaran, pantau progress, dan rayakan saat lunas!" },
  ];
  return (
    <section id="cara-kerja" className="py-24 px-6 bg-[#080C11]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Mudah & Cepat</p>
          <h2 className="text-4xl font-black tracking-tight">Cara Kerja Lunaskan.id</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 relative z-10">
                <span className="text-2xl font-black text-gold">{s.num}</span>
              </div>
              <h3 className="text-xl font-black mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PRICING ─── */
function Pricing() {
  return (
    <section id="harga" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Transparan & Terjangkau</p>
          <h2 className="text-4xl font-black tracking-tight mb-4">Pilih Paket yang Sesuai</h2>
          <p className="text-gray-500 font-medium">Mulai gratis, upgrade kapan saja saat kamu butuh fitur lengkap.</p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* PRO */}
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#B8860B]/5 border border-gold/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 blur-3xl rounded-full -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-gold">PRO</p>
                <span className="bg-gold text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Crown size={10} /> Terpopuler
                </span>
              </div>
              <p className="text-5xl font-black mb-1 text-gold">Rp 99.000</p>
              <div className="flex items-center gap-2 mb-8">
                <Infinity size={16} className="text-gold" />
                <p className="text-gray-400 text-sm font-bold">Bayar sekali, akses selamanya</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Hutang tidak terbatas",
                  "Semua fitur Free",
                  "Laporan & Analitik Detail",
                  "Simulasi What-If Analysis",
                  "Pengingat jatuh tempo",
                  "Asisten Keuangan Priority",
                  "Update fitur selamanya",
                  "Support prioritas via WhatsApp",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-white">
                    <CheckCircle2 size={16} className="text-gold shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                <button className="w-full py-4 rounded-2xl bg-gold text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold/20">
                  Upgrade ke PRO — Rp 99.000
                </button>
              </a>
              <p className="text-center text-[11px] text-gray-500 mt-3 font-medium">Pembayaran via transfer bank / e-wallet</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const testimonials = [
    { name: "Rizky A.", role: "Karyawan Swasta, Jakarta", stars: 5, text: "Hutangku ada 4 sekaligus dan aku bingung mau bayar dari mana dulu. Setelah pakai Lunaskan.id dan ikuti strategi Avalanche, dalam 8 bulan sudah lunas 2 hutang. Dashboard-nya jelas banget!" },
    { name: "Sari W.", role: "Freelancer, Surabaya", stars: 5, text: "Dulu Excel-ku amburadul karena sering salah rumus. Sekarang semua otomatis. Fitur asisten AI-nya helpful banget, bisa langsung tanya kapan kira-kira bisa lunas." },
    { name: "Budi S.", role: "Wiraswasta, Bandung", stars: 5, text: "Yang paling suka fitur simulasi extra payment-nya. Jadi tau kalau nambah Rp 300.000/bulan, waktu lunas bisa lebih cepat 6 bulan. Worth it banget harganya!" },
    { name: "Dewi K.", role: "Ibu Rumah Tangga, Medan", stars: 5, text: "Akhirnya ada aplikasi hutang yang simple dan tidak bikin pusing. Saya yang tidak ngerti keuangan pun bisa pakai dengan mudah. Terima kasih Lunaskan.id!" },
  ];
  return (
    <section id="testimoni" className="py-24 px-6 bg-[#080C11]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Kata Mereka</p>
          <h2 className="text-4xl font-black tracking-tight">Sudah Membantu Ratusan Orang</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-gold/20 transition-all">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed font-medium mb-6">"{t.text}"</p>
              <div>
                <p className="font-black text-white text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Bagaimana cara daftar?", a: "Klik tombol 'Daftar Gratis' dan hubungi admin via WhatsApp. Admin akan membuatkan akun dan mengirimkan email + password ke kamu dalam waktu singkat." },
    { q: "Apakah data hutang saya aman?", a: "Data kamu disimpan aman di server Supabase yang terlindungi. Hanya kamu yang bisa mengakses akun dan data hutangmu. Kami tidak menjual data ke pihak ketiga." },
    { q: "Apa bedanya strategi Snowball, Avalanche, dan Smart Priority?", a: "Snowball: lunasi hutang terkecil dulu untuk motivasi. Avalanche: lunasi bunga tertinggi dulu untuk hemat bunga. Smart Priority: kombinasi keduanya yang direkomendasikan sistem berdasarkan profilmu." },
    { q: "Apakah PRO bayar bulanan atau sekali bayar?", a: "Sekali bayar, akses selamanya. Tidak ada langganan bulanan yang memberatkan. Bayar Rp 99.000 satu kali dan nikmati semua fitur PRO untuk selamanya." },
    { q: "Bisa dipakai untuk hutang apa saja?", a: "Bisa untuk semua jenis hutang: KTA, kartu kredit, pinjol, cicilan motor/rumah, hutang ke keluarga/teman, PayLater, dan lainnya." },
  ];

  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-3">Ada Pertanyaan?</p>
          <h2 className="text-4xl font-black tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-black text-sm text-white pr-4">{f.q}</span>
                <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-6">
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FINAL CTA ─── */
function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-[#080C11]">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/10 blur-[80px] rounded-full -z-0" />
          <div className="relative z-10">
            <p className="text-gold text-[11px] font-black uppercase tracking-widest mb-4">Mulai Sekarang</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Waktunya Bebas<br />dari Jeratan Hutang
            </h2>
            <p className="text-gray-400 font-medium mb-10 max-w-md mx-auto">
              Ribuan orang sudah mulai perjalanan bebas hutang mereka bersama Lunaskan.id. Giliran kamu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={WA_DAFTAR} target="_blank" rel="noopener noreferrer">
                <button className="w-full sm:w-auto bg-gold text-black px-10 py-4 rounded-2xl font-black text-base hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-gold/30 flex items-center justify-center gap-2">
                  Daftar via WhatsApp <ChevronRight size={18} />
                </button>
              </a>
            </div>
            <p className="mt-6 text-xs text-gray-600 font-medium">Butuh bantuan? <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Chat admin langsung</a></p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                <Wallet className="text-black" size={18} />
              </div>
              <span className="text-xl font-black">Lunaskan.id</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-xs">
              Platform manajemen hutang cerdas untuk membantu masyarakat Indonesia bebas hutang lebih cepat.
            </p>
          </div>
          <div>
            <p className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Produk</p>
            <ul className="space-y-2.5 text-sm text-gray-500 font-medium">
              <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
              <li><a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a></li>
              <li><a href="#harga" className="hover:text-white transition-colors">Harga</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Kontak</p>
            <ul className="space-y-2.5 text-sm text-gray-500 font-medium">
              <li><a href={WA_DAFTAR} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Daftar Akun</a></li>
              <li><a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Upgrade PRO</a></li>
              <li><a href="https://wa.me/6289627314790" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Customer Service</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 font-medium">© 2025 Lunaskan.id. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
            <Lock size={12} /> Data kamu aman di server Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
