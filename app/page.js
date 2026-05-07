"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, TrendingDown, Wallet, Play, CheckCircle2, Search } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0B0F14]/80 backdrop-blur-md border-b border-white/5 py-5 px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#D4AF37] rounded-xl flex items-center justify-center">
            <Wallet className="text-black" size={20} />
          </div>
          <span className="text-xl font-black tracking-tight">Lunasin.id</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[13px] font-bold text-gray-400">
          <Link href="#" className="hover:text-gold transition-colors">Fitur</Link>
          <Link href="#" className="hover:text-gold transition-colors">Cara Kerja</Link>
          <Link href="#" className="hover:text-gold transition-colors">Harga</Link>
          <Link href="#" className="hover:text-gold transition-colors">Testimoni</Link>
          <Link href="#" className="hover:text-gold transition-colors">Blog</Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-[13px] font-bold text-white hover:text-gold transition-colors">Masuk</Link>
          <Link href="/login">
            <button className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-xl text-[13px] font-black shadow-lg shadow-gold/20 hover:scale-105 transition-transform">
              Mulai Sekarang
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-44 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-gold/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tighter">
              Lunasi Hutang <br />
              Lebih Cepat & <span className="text-[#D4AF37]">Terarah</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
              Gunakan strategi Snowball & Avalanche untuk bebas hutang lebih cepat tanpa ribet Excel. Sudah digunakan oleh ribuan orang di Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Link href="/login">
                <button className="bg-[#D4AF37] text-black px-12 py-5 rounded-[1.2rem] text-lg font-black shadow-2xl shadow-gold/20 hover:brightness-110 transition-all">
                  Mulai Sekarang
                </button>
              </Link>
              <Link href="/demo">
                <button className="flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-[1.2rem] font-black hover:bg-white/10 transition-colors">
                  <Play size={20} fill="currentColor" /> Lihat Simulasi
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-12 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gold" /> Tanpa kartu kredit</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gold" /> Aman & Privasi Terjaga</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-gold" /> Dipercaya ribuan pengguna</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-28 relative w-full max-w-6xl"
          >
             <div className="relative z-10 rounded-[2.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" alt="Dashboard Mockup" className="w-full rounded-[2rem] opacity-90 shadow-2xl" />
             </div>
             {/* Floating Mobile Mockup */}
             <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-64 aspect-[9/19] bg-dark border-8 border-white/10 rounded-[3.5rem] shadow-2xl hidden lg:block overflow-hidden z-20">
                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=2070" alt="Mobile Mockup" className="w-full h-full object-cover" />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-32 bg-[#080B0F]">
        <div className="max-w-7xl mx-auto px-12">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Kenapa <span className="text-gold">Lunasin.id?</span></h2>
            <p className="text-gray-500 font-medium">Dirancang untuk membantu keluar dari jeratan hutang dengan strategi terbaik.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Search className="text-gold" size={40} />}
              title="Bingung Prioritas Bayar Hutang?"
              desc="Kami bantu tentukan hutang mana yang harus dibayar dulu agar bunga tidak membengkak."
            />
            <FeatureCard 
              icon={<TrendingDown className="text-gold" size={40} />}
              title="Udah Bayar Tapi Hutang Gak Turun?"
              desc="Simulasi otomatis untuk strategi paling efektif. Lihat hasil nyata setiap bulannya."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="text-gold" size={40} />}
              title="Excel Ribet & Membingungkan?"
              desc="Semua dihitung otomatis, cepat & akurat. Tidak perlu rumus matematika yang sulit."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-white/5 text-center">
        <h2 className="text-3xl font-black mb-8 tracking-tight">Mulai Perjalanan Bebas Hutangmu Hari Ini</h2>
        <Link href="/login">
          <button className="bg-[#D4AF37] text-black px-12 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-gold/20 hover:scale-105 transition-transform">
            Mulai Sekarang
          </button>
        </Link>
        <div className="mt-24 text-xs font-bold text-gray-700 uppercase tracking-widest">
          © 2024 Lunasin.id. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] text-left hover:border-gold/30 transition-all group flex flex-col h-full">
      <div className="mb-8 p-4 bg-white/5 w-fit rounded-[1.5rem] group-hover:bg-gold/10 transition-colors">{icon}</div>
      <h3 className="text-2xl font-black mb-6 tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium mb-8 flex-1">{desc}</p>
      <div className="flex items-center gap-2 text-gold font-black text-xs uppercase tracking-widest">
         Selengkapnya <ArrowRight size={14} />
      </div>
    </div>
  );
}
